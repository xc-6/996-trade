import { verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  buyRecords,
  sellRecords,
  users,
  zBuyRecord,
  zSellRecord,
} from "@/db/schema";
import { db } from "@/db/mongo";
import { z } from "zod";

const app = new Hono()
  .get(
    "/buy_records",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        accountIds: z.string().optional(),
        stockCode: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findById(auth.token.id);

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const { accountIds, stockCode } = c.req.valid("query");

      const accounts = accountIds?.split(",");

      const records = await buyRecords.find(
        {
          accountId: { $in: accounts ?? user.accounts },
          stockCode: stockCode ? { $in: [stockCode] } : { $exists: true },
        },
        { sellRecords: 0 },
      );

      const data = records as unknown as Array<
        z.infer<typeof zBuyRecord> & { _id: string }
      >;

      return c.json({ data: data ?? [] }, 200);
    },
  )
  .get(
    "/buy_record/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const buyRecord = await buyRecords.findById(id);

      if (!buyRecord) {
        return c.json({ message: "Buy record not found" }, 404);
      }

      return c.json({ data: buyRecord }, 200);
    },
  )
  .post(
    "/buy_record",
    verifyAuth(),
    zValidator(
      "json",
      zBuyRecord.omit({ sellRecords: true }).extend({ buyDate: z.string() }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { stockCode, buyDate, buyPrice, buyAmount, accountId } =
        c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({
        _id: auth.token.id,
        "accounts._id": accountId,
      });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const data = await buyRecords.create({
        stockCode,
        buyDate: new Date(buyDate),
        buyPrice,
        buyAmount,
        accountId,
        unsoldAmount: buyAmount,
      });

      return c.json(data, 200);
    },
  )
  .post(
    "/buy_record/:buyRecordId/sell",
    verifyAuth(),
    zValidator("param", z.object({ buyRecordId: z.string() })),
    zValidator("json", zSellRecord.extend({ sellDate: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { buyRecordId } = c.req.valid("param");
      const { sellDate, sellAmount, sellPrice } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const buyRecord = await buyRecords.findOne({
        _id: buyRecordId,
      });

      if (!buyRecord) {
        return c.json({ error: "Buy record not found" }, 400);
      }

      // Calculate total sold amount from previous sell records
      const preSoldAmount = (buyRecord.sellRecords ?? []).reduce(
        (sum, record) => sum + Number(record.sellAmount),
        0,
      );

      // Calculate remaining amount available to sell
      const remainingAmount = Number(buyRecord.buyAmount) - preSoldAmount;

      // Validate if new sell amount exceeds remaining amount
      if (Number(sellAmount) > remainingAmount) {
        return c.json(
          {
            error: "Sell amount exceeds available amount",
            remainingAmount,
            requestedAmount: sellAmount,
          },
          400,
        );
      }

      // Calculate the profit and loss, APY
      const soldDate = new Date(sellDate);
      const profitLoss = Number(
        ((sellPrice - buyRecord.buyPrice) * sellAmount).toFixed(3),
      );
      const holdingDays = Math.ceil(
        (soldDate.getTime() - new Date(buyRecord.buyDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const profitRatio = profitLoss / (buyRecord.buyPrice * sellAmount);
      const apy = (
        (Math.pow(1 + profitRatio, 365 / holdingDays) - 1) *
        100
      ).toFixed(2);

      const sellRecord = new sellRecords({
        sellDate: sellDate,
        sellAmount: sellAmount,
        sellPrice: sellPrice,
        profitLoss: profitLoss,
        apy: apy,
      });

      await buyRecord.updateOne({
        unsoldAmount: remainingAmount - Number(sellAmount),
        sellRecords: [...(buyRecord?.sellRecords ?? []), sellRecord],
      });

      return c.json({ data: sellRecord }, 200);
    },
  )
  .delete(
    "/buy_record/:buyRecordId/sell/:sellRecordId",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        buyRecordId: z.string(),
        sellRecordId: z.string(),
      }),
    ),
    async (c) => {
      const { buyRecordId, sellRecordId } = c.req.valid("param");

      const buyRecord = await buyRecords.findById(buyRecordId);
      if (!buyRecord) {
        return c.json({ message: "Buy record not found" }, 404);
      }

      // Find the sell record that's being deleted
      const sellRecordToDelete = buyRecord.sellRecords.find(
        (record: any) => record._id?.toString() === sellRecordId,
      );

      if (!sellRecordToDelete) {
        return c.json({ message: "Sell record not found" }, 404);
      }

      // Remove the sell record from the array
      buyRecord.sellRecords = buyRecord.sellRecords.filter(
        (record: any) => record._id?.toString() !== sellRecordId,
      );

      // Add back the sold amount to unsoldAmount
      buyRecord.unsoldAmount =
        Number(buyRecord.unsoldAmount) + Number(sellRecordToDelete.sellAmount);

      await buyRecord.save();

      return c.json({ message: "Sell record deleted successfully" }, 200);
    },
  )
  .delete(
    "/buy_record/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const data = await buyRecords.findOneAndDelete({ _id: id });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: { id } }, 200);
    },
  )
  .get(
    "/stock_groups",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        accountIds: z.string(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const { accountIds } = c.req.valid("query");
      const accounts = accountIds.split(",");

      // Fetch records for the specified accounts
      const records = await buyRecords.find({ accountId: { $in: accounts } });

      // Group and calculate totals by stock code
      const groupedRecords = records.reduce(
        (acc, record) => {
          const stockCode = record.stockCode;

          if (!acc[stockCode]) {
            acc[stockCode] = {
              totalBuyAmount: 0,
              totalUnsoldAmount: 0,
              totalCost: 0,
              avgCost: 0,
              totalPL: 0,
            };
          }

          // Update totals
          acc[stockCode].totalBuyAmount += Number(record.buyAmount);
          acc[stockCode].totalUnsoldAmount += Number(record.unsoldAmount);
          acc[stockCode].totalCost +=
            Number(record.buyPrice) * Number(record.unsoldAmount);

          // Calculate average cost with 3 decimal places
          acc[stockCode].avgCost =
            acc[stockCode].totalUnsoldAmount > 0
              ? Number(
                  (
                    acc[stockCode].totalCost / acc[stockCode].totalUnsoldAmount
                  ).toFixed(3),
                )
              : 0;

          // Calculate total Profit and Loss
          const totalPL = record.sellRecords.reduce(
            (sum, sellRecord) => sum + Number(sellRecord.profitLoss),
            0,
          );
          acc[stockCode].totalPL += totalPL;

          return acc;
        },
        {} as Record<
          string,
          {
            totalBuyAmount: number;
            totalUnsoldAmount: number;
            totalCost: number;
            avgCost: number;
            totalPL: number;
          }
        >,
      );

      return c.json({ data: groupedRecords }, 200);
    },
  )
  .get(
    "/stock_codes",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        accountIds: z.string(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const { accountIds } = c.req.valid("query");
      const accounts = accountIds.split(",");

      // Fetch records for the specified accounts
      const records = await buyRecords.find({ accountId: { $in: accounts } });

      // Extract unique stock codes
      const stockCodes = new Set(records.map((record) => record.stockCode));

      return c.json({ data: Array.from(stockCodes) }, 200);
    },
  );
export default app;

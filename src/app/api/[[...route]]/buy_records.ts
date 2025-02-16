import { verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";
import { db } from "@/db/mongo";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { zValidator } from "@hono/zod-validator";
import { generateFilter } from "../_utils";
import { divBatchRecords } from "@/db/schema";

import {
  buyRecords,
  sellRecords,
  users,
  zBuyRecord,
  zSellRecord,
} from "@/db/schema";

const app = new Hono()
  .post(
    "/list",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        accountIds: z.array(z.string()).optional(),
        stockCode: z.array(z.string()).optional(),
        showSold: z.boolean().optional().default(false),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
        key: z.string().optional().default("buyDate"),
        order: z.enum(["asc", "desc"]).optional().default("desc"),
        filter: z
          .record(
            z.string(),
            z
              .object({
                min: z.union([z.number(), z.string()]).optional(),
                max: z.union([z.number(), z.string()]).optional(),
              })
              .optional()
              .default({}),
          )
          .optional()
          .default({}),
      }),
    ),
    async (c) => {
      // Get all buy records by the account ids
      const auth = c.get("authUser");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findById(auth.token.id);

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const {
        accountIds,
        stockCode,
        showSold,
        page,
        limit,
        key,
        order,
        filter,
      } = c.req.valid("json");

      const accounts = accountIds?.map((id) => new ObjectId(id));

      const selectFields = showSold ? {} : { sellRecords: 0 };

      const pipeline: any[] = [
        {
          $match: {
            accountId: { $in: accounts ?? user.accounts },
            stockCode: stockCode ? { $in: stockCode } : { $exists: true },
            ...generateFilter(filter),
          },
        },
        {
          $sort: {
            [key]: order === "asc" ? 1 : -1,
          },
        },
        {
          $facet: {
            total: [{ $count: "count" }],
            records: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              { $project: selectFields },
            ],
          },
        },
        {
          $project: {
            total: { $arrayElemAt: ["$total.count", 0] },
            records: 1,
          },
        },
      ];

      const result = await buyRecords.aggregate(pipeline).exec();
      const total = result[0]?.total ?? 0;
      const list = (result[0]?.records ?? []) as unknown as Array<
        z.infer<typeof zBuyRecord> & { _id: string }
      >;

      return c.json(
        {
          data: list ?? [],
          nextPage: list.length === limit ? page + 1 : null,
          total,
        },
        200,
      );
    },
  )
  .post(
    "/",
    verifyAuth(),
    zValidator(
      "json",
      zBuyRecord
        .omit({ sellRecords: true, _id: true })
        .extend({ buyDate: z.string() }),
    ),
    async (c) => {
      // Create a new buy record
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
  .get(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      // Get the buy record by the buy record id
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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _zBuyRecord = zBuyRecord.extend({
        sellRecords: z.array(zSellRecord.extend({ _id: z.string() })),
      });

      const buyRecord = (await buyRecords.findById(id)) as unknown as z.infer<
        typeof _zBuyRecord
      > & { _id: string };

      if (!buyRecord) {
        return c.json({ message: "Buy record not found" }, 404);
      }

      // Sort the sellRecords by sellDate in descending order
      buyRecord.sellRecords.sort((a, b) => {
        return new Date(b.sellDate).getTime() - new Date(a.sellDate).getTime();
      });

      return c.json({ data: buyRecord }, 200);
    },
  )
  .delete(
    "/:buyRecordId/sell/:sellRecordId",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        buyRecordId: z.string(),
        sellRecordId: z.string(),
      }),
    ),
    async (c) => {
      // Delete the sell record by the buy record id and sell record id
      const { buyRecordId, sellRecordId } = c.req.valid("param");

      const buyRecord = await buyRecords.findById(buyRecordId);
      if (!buyRecord) {
        return c.json({ message: "Buy record not found" }, 404);
      }

      // Find the sold record that's being deleted
      const sellRecordToDelete = buyRecord.sellRecords.find(
        (record: any) => record._id?.toString() === sellRecordId,
      );

      if (!sellRecordToDelete) {
        return c.json({ message: "Sell record not found" }, 404);
      }

      // Remove the sold record from the array
      buyRecord.sellRecords = buyRecord.sellRecords.filter(
        (record: any) => record._id?.toString() !== sellRecordId,
      );

      // Add back the sold amount to unsoldAmount
      buyRecord.unsoldAmount =
        Number(buyRecord.unsoldAmount) + Number(sellRecordToDelete.sellAmount);

      buyRecord.profitLoss =
        Number(buyRecord.profitLoss) - Number(sellRecordToDelete.profitLoss);

      await buyRecord.save();

      return c.json({ message: "Sell record deleted successfully" }, 200);
    },
  )
  .delete(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      // Delete the buy record by the buy record id
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

      const accountId = data?.accountId.toString(); // Step 1: Get the accountId
      const stockCode = data?.stockCode; // Get the stockCode

      // Step 2: Find the associated div_batch_records by the accountId
      const matchedDivBatchRecords = await divBatchRecords.find({
        stockCode: stockCode,
        accountIds: { $in: [new ObjectId(accountId)] },
      });

      // Step 3: Remove the associated divRecord in the array divRecords
      for (const divBatchRecord of matchedDivBatchRecords) {
        divBatchRecord.divRecords = divBatchRecord.divRecords.filter(
          (divRecord) => divRecord.buyRecordId.toString() !== id, // Use the deleted buyRecordId
        );

        // Step4: For loop the divRecords, if the accountId is not found in the divRecords, remove the accountId from the accountIds array

        if (divBatchRecord.divRecords.length === 0) {
          // If the divRecords array is empty, remove the whole document
          await divBatchRecord.deleteOne();
        } else {
          // Check if the accountId is still present in any divRecords
          const accountIdExistsInDivRecords = divBatchRecord.divRecords.some(
            (divRecord) => divRecord.accountId.toString() === accountId,
          );

          // If the accountId is not found in any divRecords, remove it from accountIds
          if (!accountIdExistsInDivRecords) {
            divBatchRecord.accountIds = divBatchRecord.accountIds.filter(
              (accId) => accId.toString() !== accountId,
            );
          }

          await divBatchRecord.save(); // Save the updated divBatchRecord
        }
      }

      return c.json({ data: { id } }, 200);
    },
  )
  .post(
    "/:buyRecordId/sell",
    verifyAuth(),
    zValidator("param", z.object({ buyRecordId: z.string() })),
    zValidator(
      "json",
      zSellRecord.omit({ _id: true }).extend({ sellDate: z.string() }),
    ),
    async (c) => {
      // Create a new sell record
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

      // Validate if new Sold Amount exceeds remaining amount
      if (Number(sellAmount) > remainingAmount) {
        return c.json(
          {
            error: "Sold Amount exceeds available amount",
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
      const apy = Number(
        ((Math.pow(1 + profitRatio, 365 / holdingDays) - 1) * 100).toFixed(2),
      );

      const sellRecord = new sellRecords({
        sellDate: sellDate,
        sellAmount: sellAmount,
        sellPrice: sellPrice,
        profitLoss: profitLoss,
        apy: apy,
      });

      await buyRecord.updateOne({
        unsoldAmount: remainingAmount - Number(sellAmount),
        profitLoss: Number(buyRecord.profitLoss) + profitLoss,
        sellRecords: [...(buyRecord?.sellRecords ?? []), sellRecord],
      });

      return c.json({ data: sellRecord }, 200);
    },
  )
  .post(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      zBuyRecord
        .omit({ sellRecords: true, _id: true })
        .extend({ buyDate: z.string() }),
    ),
    async (c) => {
      // Edit the buy record by the buy record id
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
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

      // Get the buy record and update it
      const buyRecord = await buyRecords.findOne({
        _id: id,
      });
      if (!buyRecord) {
        return c.json({ error: "Buy record not found" }, 400);
      }

      const preSoldAmount = (buyRecord.sellRecords ?? []).reduce(
        (sum, record) => sum + Number(record.sellAmount),
        0,
      );

      if (buyAmount < preSoldAmount) {
        return c.json(
          {
            error: "Buy Amount cannot be less than Sold Amount",
            preSoldAmount,
          },
          400,
        );
      }

      // Get the earlier sold date, if the buy date is after the sell date then error
      const earliestSellDate = buyRecord.sellRecords.reduce(
        (earliest, record) =>
          record.sellDate < earliest ? record.sellDate : earliest,
        new Date(),
      );
      if (new Date(buyDate) > earliestSellDate) {
        return c.json(
          {
            error: "Buy Date cannot be later than the earliest sold Date",
            earliestSellDate,
          },
          400,
        );
      }

      const data = await buyRecords.findOneAndUpdate(
        { _id: id },
        {
          stockCode,
          buyDate: new Date(buyDate),
          buyPrice,
          buyAmount,
          accountId,
          unsoldAmount: buyAmount - preSoldAmount,
        },
        { new: true, sellRecords: 0 },
      );

      return c.json(data, 200);
    },
  );

export default app;

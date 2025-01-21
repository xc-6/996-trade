import { Hono } from "hono";
import { z } from "zod";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";
import {
  buyRecords,
  sellRecords,
  users,
  zBuyRecord,
  zSellRecord,
} from "@/db/schema";
import { db } from "@/db/mongo";

const app = new Hono().post(
  "/records",
  verifyAuth(),
  zValidator(
    "json",
    z.object({
      accountId: z.string(),
      records: z.array(
        zBuyRecord.omit({ accountId: true, _id: true }).extend({
          buyDate: z.string(),
          sellRecords: z.array(
            zSellRecord.omit({ _id: true }).extend({ sellDate: z.string() }),
          ),
        }),
      ),
    }),
  ),
  async (c) => {
    const auth = c.get("authUser");
    const { accountId, records } = c.req.valid("json");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await db();

    const user = await users.findOne({
      _id: auth.token.id,
      "accounts._id": accountId,
    });

    if (!user) {
      return c.json({ error: "Unauthorized or account not found" }, 401);
    }

    // Process each record
    const buyRecordsToInsert = [];
    for (const record of records) {
      const stockCode = record.stockCode;
      const buyDate = new Date(record.buyDate);
      const buyPrice = record.buyPrice;
      const buyAmount = record.buyAmount;
      let unsoldAmount = record.buyAmount;
      let buyRecordProfitLoss = 0;

      const sellRecordsToInsert = [];
      // Process and append sell records if they exist
      if (record.sellRecords && record.sellRecords.length > 0) {
        for (const sellRecord of record.sellRecords) {
          // Calculate the profit and loss, APY
          const soldDate = new Date(sellRecord.sellDate);
          const profitLoss = Number(
            ((sellRecord.sellPrice - buyPrice) * sellRecord.sellAmount).toFixed(
              3,
            ),
          );
          const holdingDays = Math.ceil(
            (soldDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          const profitRatio = profitLoss / (buyPrice * sellRecord.sellAmount);
          const apy = (
            (Math.pow(1 + profitRatio, 365 / holdingDays) - 1) *
            100
          ).toFixed(2);

          // Calculate the unsold amount, profit and loss
          unsoldAmount -= sellRecord.sellAmount;
          if (unsoldAmount < 0) {
            return c.json({ error: "Unsold amount cannot be negative" }, 400);
          }
          buyRecordProfitLoss += profitLoss;

          // Create the sell record
          const newSoldRecord = new sellRecords({
            sellDate: soldDate,
            sellAmount: sellRecord.sellAmount,
            sellPrice: sellRecord.sellPrice,
            profitLoss: profitLoss,
            apy: apy,
          });

          sellRecordsToInsert.push(newSoldRecord);
        }
      }

      const newBuyRecord = new buyRecords({
        stockCode: stockCode,
        buyDate: buyDate,
        buyPrice: buyPrice,
        buyAmount: buyAmount,
        accountId: accountId,
        unsoldAmount: unsoldAmount,
        sellRecords: sellRecordsToInsert,
        profitLoss: buyRecordProfitLoss,
      });

      buyRecordsToInsert.push(newBuyRecord);
    }

    const uploadData = await buyRecords.insertMany(buyRecordsToInsert);
    uploadData as unknown as Array<
      z.infer<typeof zBuyRecord> & { _id: string }
    >;

    return c.json({ data: uploadData }, 200);
  },
);

export default app;

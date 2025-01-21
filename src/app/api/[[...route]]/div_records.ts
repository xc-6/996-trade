import { verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";
import { db } from "@/db/mongo";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { zValidator } from "@hono/zod-validator";

import {
  buyRecords,
  users,
  divBatchRecords,
  zDivBatchRecord,
} from "@/db/schema";

const app = new Hono()
  .post(
    "/",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        divDate: z.string(),
        stockCode: z.string(),
        perDiv: z.number(),
        list: z.array(
          z.object({
            divAmount: z.number(),
            buyRecordId: z.string(),
          }),
        ),
      }),
    ),
    async (c) => {
      // Create a new dividend record
      const auth = c.get("authUser");
      const { list, divDate, stockCode, perDiv } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const map: Map<string, number> = new Map(
        list.map((item) => [String(item.buyRecordId), item.divAmount]),
      );
      const ids = list.map((item) => new ObjectId(item.buyRecordId));

      const buyRecordList = await buyRecords.find({
        _id: { $in: ids },
      });

      const accountIds = Array.from(
        new Set(buyRecordList?.map((item) => String(item.accountId))),
      );

      const divRecords = buyRecordList.map((item) => ({
        divAmount: map.get(String(item._id)),
        accountId: item.accountId,
        buyRecordId: item._id,
      }));

      const data = await divBatchRecords.create({
        perDiv,
        divDate,
        stockCode,
        accountIds,
        divRecords,
      });

      return c.json(
        {
          data,
        },
        200,
      );
    },
  )
  .post(
    "/stock_codes",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        accountIds: z.array(z.string()).optional(),
      }),
    ),
    async (c) => {
      // Get the buy record by the buy record id
      const auth = c.get("authUser");
      const { accountIds } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const list = await divBatchRecords.find({
        accountIds: {
          $elemMatch: { $in: accountIds ?? [] },
        },
      });

      const stockCodes = new Set(list.map((batch) => batch.stockCode));

      return c.json({ data: Array.from(stockCodes) }, 200);
    },
  )
  .post(
    "/batch",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        accountIds: z.array(z.string()),
        stockCode: z.string(),
      }),
    ),
    async (c) => {
      // Get the buy record by the buy record id
      const auth = c.get("authUser");
      const { accountIds, stockCode } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const data = (await divBatchRecords.find({
        accountIds: {
          $elemMatch: { $in: accountIds ?? [] },
        },
        stockCode,
      })) as Array<z.infer<typeof zDivBatchRecord>>;

      return c.json({ data }, 200);
    },
  )
  .post(
    "/batch/:batchId",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        batchId: z.string(),
      }),
    ),
    zValidator(
      "json",
      z.object({
        divDate: z.string(),
        stockCode: z.string(),
        perDiv: z.number(),
        list: z.array(
          z.object({
            divAmount: z.number(),
            buyRecordId: z.string(),
          }),
        ),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { batchId } = c.req.valid("param");
      const { perDiv, divDate, list, stockCode } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const map: Map<string, number> = new Map(
        list.map((item) => [String(item.buyRecordId), item.divAmount]),
      );
      const ids = list.map((item) => new ObjectId(item.buyRecordId));

      const buyRecordList = await buyRecords.find({
        _id: { $in: ids },
      });

      const accountIds = Array.from(
        new Set(buyRecordList?.map((item) => String(item.accountId))),
      );

      const divRecords = buyRecordList.map((item) => ({
        divAmount: map.get(String(item._id)),
        accountId: item.accountId,
        buyRecordId: item._id,
      }));

      const data = await divBatchRecords.findOneAndUpdate(
        { _id: batchId },
        {
          $set: {
            perDiv,
            divDate,
            stockCode,
            accountIds,
            divRecords,
          },
        },
        { returnDocument: "after" },
      );

      return c.json({ data }, 200);
    },
  )
  .get(
    "/batch/:batchId",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        batchId: z.string(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { batchId } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const divBatch = await divBatchRecords.findOne({ _id: batchId });

      if (!divBatch) {
        return c.json({ error: "Not found" }, 404);
      }

      const { divRecords: _divRecords, ...rest } = divBatch.toObject();

      const buyIds = _divRecords.map((div) => div.buyRecordId);

      const buyRecordList = await buyRecords.find({
        _id: { $in: buyIds },
      });

      const buyRecordsMap = new Map(
        buyRecordList.map((item) => [String(item._id), item]),
      );

      const list = _divRecords
        .map((item) => {
          const info = buyRecordsMap.get(String(item.buyRecordId));
          return {
            ...item,
            accountId: info?.accountId,
            buyRecordId: info?._id,
            buyAmount: info?.buyAmount,
            buyDate: info?.buyDate,
            buyPrice: info?.buyPrice,
          };
        })
        .sort((a, b) => {
          return (
            new Date(b.buyDate ?? 0).getTime() -
            new Date(a.buyDate ?? 0).getTime()
          );
        });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const zData = zDivBatchRecord
        .omit({
          divRecords: true,
        })
        .extend({
          list: z.array(
            z.object({
              divAmount: z.number(),
              accountId: z.string(),
              buyRecordId: z.string(),
              buyAmount: z.number(),
              buyDate: z.date(),
              buyPrice: z.number(),
            }),
          ),
        });

      const data = {
        ...rest,
        list,
      } as unknown as z.infer<typeof zData>;

      return c.json({ data }, 200);
    },
  )
  .delete(
    "/batch/:batchId",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        batchId: z.string(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { batchId } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const data = await divBatchRecords.findOneAndDelete({ _id: batchId });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json(
        {
          data: { id: batchId },
        },
        200,
      );
    },
  )
  .get(
    "/buy_record/:buyRecordId",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        buyRecordId: z.string(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { buyRecordId } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      const buyRecord = (
        await buyRecords.findOne({ _id: buyRecordId })
      )?.toObject();

      if (!buyRecord) {
        return c.json({ error: "Not found" }, 404);
      }

      const list = await divBatchRecords
        .aggregate([
          {
            $unwind: "$divRecords",
          },
          {
            $match: {
              "divRecords.buyRecordId": new ObjectId(buyRecordId),
            },
          },
          {
            $project: {
              allFields: {
                $mergeObjects: ["$$ROOT", "$divRecords", { batchId: "$_id" }],
              },
            },
          },
          {
            $replaceRoot: { newRoot: "$allFields" },
          },
          {
            $project: {
              divRecords: 0,
              _id: 0,
              accountIds: 0,
            },
          },
        ])
        .exec();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const zData = zDivBatchRecord
        .omit({
          divRecords: true,
        })
        .extend({
          divAmount: z.number(),
          batchId: z.string(),
          accountId: z.string(),
          buyRecordId: z.string(),
        });

      const data = list as unknown as Array<z.infer<typeof zData>>;

      return c.json({ data }, 200);
    },
  );
export default app;

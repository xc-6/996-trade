import { verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";
import { db } from "@/db/mongo";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { zValidator } from "@hono/zod-validator";

import { buyRecords, users, zSellRecord, zBuyRecord } from "@/db/schema";

const app = new Hono().get(
  "/",
  verifyAuth(),
  zValidator(
    "query",
    z.object({
      accountIds: z.string().optional(),
    }),
  ),
  async (c) => {
    // Get the sell records by the account ids, and insert the buy record id in each sell record
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await db();

    const user = await users.findById(auth.token.id);

    if (!user) {
      return c.json({ error: "Something went wrong" }, 400);
    }

    const { accountIds } = c.req.valid("query");

    const accounts = accountIds?.split(",").map((id) => new ObjectId(id));

    const sellRecords = await buyRecords.aggregate([
      {
        $match: {
          accountId: { $in: accounts ?? user.accounts },
        },
      },
      {
        $unwind: "$sellRecords",
      },
      {
        $sort: {
          "sellRecords.sellDate": -1,
        },
      },
      {
        $project: {
          allFields: {
            $mergeObjects: ["$$ROOT", "$sellRecords", { buyRecordId: "$_id" }],
          },
        },
      },
      {
        $replaceRoot: { newRoot: "$allFields" },
      },
      {
        $project: {
          sellRecords: 0,
        },
      },
    ]);
    const data = sellRecords as unknown as Array<
      z.infer<typeof zSellRecord> &
        z.infer<typeof zBuyRecord> & { _id: string; buyRecordId: string }
    >;

    return c.json({ data: data ?? [] }, 200);
  },
);

export default app;

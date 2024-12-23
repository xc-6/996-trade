import { verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { buyRecords, sellRecords, users, zBuyRecord, zSellRecord } from "@/db/schema";
import { db } from "@/db/mongo";
import { z } from "zod";

const app = new Hono()
.get("/",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        accountIds: z.string().optional()
      })
    ),
    async (c)  => {
        const auth = c.get("authUser");

        if (!auth.token?.id) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        await db();

        const user = await users.findById( auth.token.id);

        if (!user) {
            return c.json({ error: "Something went wrong" }, 400);
        }

        const { accountIds } =  c.req.valid("query");

        const accounts = accountIds?.split(",")

        const records = await buyRecords.find({ accountId: { $in: accounts??user.accounts } });

        const data = records as unknown as Array<z.infer<typeof zBuyRecord> & { _id: string }>;

        return c.json({ data: data??[] }, 200);
    }
)
.post(
  "/",
  verifyAuth(),
  zValidator(
    "json",
    zBuyRecord.omit({sellRecords: true}).extend({buyDate: z.string()})
  ),
  async (c) => {

    const auth = c.get("authUser");
    const { stockCode, buyDate, buyPrice, buyAmount, accountId } = c.req.valid("json");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    await db();

    const user = await users.findOne( { _id: auth.token.id , 'accounts._id': accountId });

    if (!user) {
      return c.json({ error: "Something went wrong" }, 400);
    }

    const data = await buyRecords.create({
      stockCode, buyDate: new Date(buyDate), buyPrice, buyAmount,
      accountId
    });

    return c.json(data, 200);
  }
)
.post(
  "/:buyRecordId/sell",
  verifyAuth(),
  zValidator("param", z.object({ buyRecordId: z.string() })),
  zValidator(
    "json",
    zSellRecord.extend({sellDate: z.string()})
  ),
  async (c) => {

    const auth = c.get("authUser");
    const { buyRecordId } = c.req.valid("param")
    const { sellDate, sellAmount, sellPrice } = c.req.valid("json");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    await db();

    const user = await users.findOne( { _id: auth.token.id });

    if (!user) {
      return c.json({ error: "Something went wrong" }, 400);
    }

    const buyRecord = await buyRecords.findOne({
      _id: buyRecordId,
    })

    if (!buyRecord) {
      return c.json({ error: "Something went wrong" }, 400);
    }

    const sellRecord = new sellRecords({
      sellDate: new Date(sellDate),
      sellAmount,
      sellPrice
    })
    
    await buyRecord.updateOne({
      sellRecords: [...buyRecord?.sellRecords??[], sellRecord]
    })

    return c.json({data: sellRecord}, 200);
  }
)
.delete(
  "/:id",
  verifyAuth(),
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const auth = c.get("authUser");
    const { id } = c.req.valid("param");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await db();

    const user = await users.findOne( { _id: auth.token.id });

    if (!user) {
      return c.json({ error: "Something went wrong" }, 400);
    }

    const data = await buyRecords.findOneAndDelete( { _id: id });

    if (!data) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data: { id } });
  },
)
;

export default app;

import { Hono } from "hono";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";
import { accounts, buyRecords, users, zAccount } from "@/db/schema";
import { db } from "@/db/mongo";
import { z } from "zod";

const app = new Hono()
  .get("/", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await db();

    const user = await users.findById(auth.token.id);

    if (!user) {
      return c.json({ error: "Something went wrong" }, 400);
    }

    const data = user.accounts as Array<
      z.infer<typeof zAccount> & { _id: string }
    >;

    return c.json({ data: data ?? [] }, 200);
  })
  .post("/", verifyAuth(), zValidator("json", zAccount), async (c) => {
    const auth = c.get("authUser");
    const { name, currency } = c.req.valid("json");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await db();

    const user = await users.findById(auth.token.id);

    if (!user) {
      return c.json({ error: "Something went wrong" }, 400);
    }

    const account = new accounts({
      name,
      currency,
    });

    await user.updateOne({
      accounts: [...(user?.accounts ?? []), account],
    });

    return c.json({ data: account }, 200);
  })
  .delete(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const id = c.req.param("id");

      await db();

      const user = await users.findOne({ _id: auth.token.id });

      if (!user) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      if (!user.accounts || user.accounts.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      await buyRecords.deleteMany({ accountId: id });

      user.accounts = user.accounts.filter(
        (account: any) => account?._id?.toString() !== id,
      );

      await user.save();

      return c.json({ data: user }, 200);
    },
  );
export default app;

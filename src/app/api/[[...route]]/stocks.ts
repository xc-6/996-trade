import { verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { stocks } from "stock-api";
import { z } from "zod";

const app = new Hono().get(
  "/",
  verifyAuth(),
  zValidator(
    "query",
    z.object({
      input: z.string(),
    }),
  ),
  async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { input } = c.req.valid("query");

    const arr = input.split(",");

    const data = await stocks.tencent.getStocks(arr);

    return c.json({ data: data ?? [] }, 200);
  },
);

export default app;

import { z } from "zod";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { zValidator } from "@hono/zod-validator";

import { users } from "@/db/schema";

const app = new Hono().post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(3).max(20),
    })
  ),
  async (c) => {
    const { name, email, password } = c.req.valid("json");

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await users.findOne({
      email,
    });

    if (user) {
      return c.json({ error: "Email already in use" }, 400);
    }

    await users.create({
      email,
      name,
      password: hashedPassword,
    });

    return c.json(null, 200);
  }
);

export default app;

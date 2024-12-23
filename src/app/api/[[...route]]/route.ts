import { Context, Hono } from "hono";
import { handle } from "hono/vercel";

import { initAuthConfig, type AuthConfig } from "@hono/auth-js";
import authConfig from "@/auth.config";
import users from "./users";
import accounts from "./accounts";
import records from "./records";
import stocks from "./stocks";

const getAuthConfig = (c: Context) => {
  return {
    secret: c.env?.AUTH_SECRET,
    ...authConfig,
  } as unknown as AuthConfig;
};

const app = new Hono().basePath("/api");

app.use("*", initAuthConfig(getAuthConfig));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/users", users)
  .route("/accounts", accounts)
  .route("/records", records)
  .route("/stocks", stocks);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

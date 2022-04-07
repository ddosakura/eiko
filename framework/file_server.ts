// File Server
import { oak } from "deps";

export const newFileServer = (
  root = Deno.cwd(),
  index = "index.html",
): oak.Middleware =>
  async (ctx, next) => {
    try {
      await ctx.send({ root, index });
    } catch {
      next();
    }
  };

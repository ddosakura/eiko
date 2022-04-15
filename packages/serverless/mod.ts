export * from "./utils.ts";
export * from "./core.ts";

import {
  Application,
  registerController,
  registerService,
  Service,
  Status,
} from "@eiko/oakd/mod.ts";
import { singleton } from "@eiko/shared/mod.ts";
import { expose, Lambda } from "./core.ts";
// deno-lint-ignore no-explicit-any
export const exposeControllers = (...controllers: any[]) => {
  const APP = {};
  return expose(async (_ctx, req, lambda) => {
    const app = singleton(APP, () => {
      const app = new Application();
      registerService(SVR_LAMBDA, lambda);
      registerController(app, ...controllers);
      return app;
    });
    return await app.handle(req) ??
      new Response(null, { status: Status.ServiceUnavailable });
  });
};

const SVR_LAMBDA = "lambda";
export const LambdaService = (svr: string) =>
  Service(SVR_LAMBDA, (lambda: Lambda): Lambda => {
    return (input, init) => {
      if (typeof input === "string") {
        return lambda(new URL(input, `http://${svr}.lambda`).toString(), init);
      }
      return lambda(input, init);
    };
  });

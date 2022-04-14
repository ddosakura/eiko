import { singleton } from "@eiko/shared/mod.ts";
import { expose, Lambda } from "@eiko/serverless/mod.ts";
import {
  Application,
  Controller,
  Get,
  registerController,
  Status,
} from "@eiko/oakd/mod.ts";

@Controller()
class AppController {
  // @Service
  // private lambda!: Lambda;

  @Get("/")
  foo() {
    return { code: 0, msg: "foo2" };
  }
  @Get("/bar")
  bar() {
    return { code: 0, msg: "fooBar" };
  }
  @Get("/lambda")
  testLambda() {
    // TODO: lambda
    return { code: 0, msg: "lambda" };
  }
}

const APP = {};
export default expose(async (_ctx, req, lambda) => {
  const app = singleton(APP, () => {
    const app = new Application();
    registerController(app, AppController);
    return app;
  });
  return await app.handle(req) ??
    new Response(null, { status: Status.ServiceUnavailable });
});

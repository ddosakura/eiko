import {
  Application,
  Autowired,
  Context,
  Controller,
  Ctx,
  Delete,
  Get,
  Param,
  Query,
  registerController,
  registerService,
} from "@eiko/oakd/mod.ts";

@Controller()
export class AppController {
  // @Get()
  // get(@Headers("user-agent") userAgent: string) {
  //   return { status: "ok", userAgent };
  // }
  @Get("/123")
  foo() {
    return { text: "Hello World!" };
  }
}

{
  const app = new Application();
  registerController(app, AppController);
  {
    const resp = await app.handle(new Request("http://localhost/123"));
    console.log(await resp?.json());
  }
  {
    const resp = await app.handle(new Request("http://localhost/404"));
    console.log(resp?.status);
  }
}

@Controller("/foo")
export class FooController {
  @Autowired
  private inject!: (msg: string) => void;

  @Get("/hello/:name")
  hello(
    @Param("name") name: string,
    @Query("times", (s) => parseInt(s ?? "1", 10)) times: number,
  ) {
    console.log("inject");
    this.inject(`Hello ${name}`);

    const text = Array(times).fill(`Hello ${name}`).join("|");
    return { text };
  }
}
registerService("inject", (msg: string) => console.log("inject", msg));

@Controller("/bar")
export class BarController {
  @Delete("/baz")
  baz(@Ctx ctx: Context) {
    return { text: ctx.request.url.href };
  }
}

{
  const app = new Application();
  registerController(
    app,
    FooController,
    BarController,
  );
  {
    const resp = await app.handle(
      new Request("http://localhost/foo/hello/boy?times=3"),
    );
    console.log(await resp?.json());
  }
  {
    const resp = await app.handle(
      new Request("http://localhost/bar/baz", { method: "delete" }),
    );
    console.log(await resp?.json());
  }
  {
    const resp = await app.handle(new Request("http://localhost/404"));
    console.log(resp?.status);
  }
}

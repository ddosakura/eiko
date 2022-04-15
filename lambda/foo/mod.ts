import {
  exposeControllers,
  Lambda,
  LambdaService,
} from "@eiko/serverless/mod.ts";
import { Autowired, Controller, Get, Service } from "@eiko/oakd/mod.ts";

@Controller()
class AppController {
  @Autowired
  private lambda!: Lambda;
  @Service("lambda")
  private lambda2!: Lambda;
  @LambdaService("foo")
  private lambda3!: Lambda;

  @Get("/")
  foo() {
    return { code: 0, msg: "foo2" };
  }
  @Get("/bar")
  bar() {
    return { code: 0, msg: "fooBar" };
  }
  @Get("/lambda")
  async testLambda() {
    const lambda = await (await this.lambda("http://foo.lambda/bar")).json();
    const lambda2 = await (await this.lambda2("http://foo.lambda")).json();
    const lambda3 = await (await this.lambda3("/bar")).json();
    return { code: 0, data: { lambda, lambda2, lambda3 } };
  }
}

export default exposeControllers(AppController);

// deno-lint-ignore-file no-explicit-any ban-types

import { Application, Router, RouterContext } from "./deps.ts";

class BaseController {}
const controllers = new WeakMap<BaseController, {
  method?: HTTPMethod;
  path: string;
  name: string;
  fn: Function;
}[]>();
export enum HTTPMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}
function httpMethodFactory(method?: HTTPMethod) {
  return (path: string) => {
    return (target: any, name: string, descriptor: PropertyDescriptor) => {
      const key = target;
      if (!controllers.has(key)) controllers.set(key, []);
      descriptor.value && controllers.get(key)?.push({
        method,
        path,
        name,
        fn: descriptor.value.bind(target),
      });
    };
  };
}
export const Get = httpMethodFactory(HTTPMethod.GET);
export const Post = httpMethodFactory(HTTPMethod.POST);
export const Delete = httpMethodFactory(HTTPMethod.DELETE);
export const Put = httpMethodFactory(HTTPMethod.PUT);

const args = new WeakMap<
  BaseController,
  Map<string, ((ctx: RouterContext<string>) => any)[]>
>();
const argFactory = (
  payload: (ctx: RouterContext<string>) => any,
) =>
  (target: any, name: string, index: number) => {
    const key = target;
    if (!args.has(key)) args.set(key, new Map());
    const list = args.get(key)!;
    if (!list.has(name)) list.set(name, []);
    list.get(name)![index] = payload;
  };
export const Ctx = argFactory((ctx) => ctx);
export const Param = (name: string, fmt?: (param: string) => any) =>
  argFactory((ctx) => {
    const param = ctx.params[name];
    return fmt ? fmt(param) : param;
  });
// TODO: required
export const Query = (name: string, fmt?: (param?: string) => any) =>
  argFactory((ctx) => {
    const param = ctx.request.url.searchParams.get(name) ??
      undefined;
    return fmt ? fmt(param) : param;
  });

const getMethodName = <T extends HTTPMethod>(method?: T) =>
  method?.toLocaleLowerCase() as "all" ?? "all";
const routers = new WeakMap<
  BaseController,
  { prefix?: string; router: Router }
>();
export function Controller(prefix?: string) {
  return (constructor: any) => {
    const router = new Router();
    const key = constructor.prototype;
    controllers.get(key)?.forEach(({ method, path, name, fn }) => {
      router[getMethodName(method)](
        path,
        async (ctx: RouterContext<string>) => {
          const body = await fn(
            ...[...args.get(key)?.get(name) ?? []].map((f) => f(ctx)),
          );
          ctx.response.body = body;
        },
      );
    });
    router.prefix;
    return class extends constructor {
      constructor() {
        super();
        routers.set(this, { prefix, router });
      }
    } as any;
  };
}

const services = new Map<string, any>();
export const registerService = (name: string, service: any) =>
  services.set(name, service);
export const Autowired = (target: any, name: string) => {
  Object.defineProperty(target, name, {
    get() {
      return services.get(name);
    },
  });
};
export const Service = (svr: string, wrap?: (fn: any) => any) =>
  (target: any, name: string) => {
    Object.defineProperty(target, name, {
      get() {
        const service = services.get(svr);
        return wrap ? wrap(service) : service;
      },
    });
  };

export const registerController = (
  app: Application,
  ...controllers: typeof BaseController[]
) => {
  /*
  if (controllers.length === 1) {
    const [controller] = controllers;
    const { prefix, router } = routers.get(new controller()) ?? {};
    if (router) {
      prefix && router.prefix(prefix);
      app.use(router.routes(), router.allowedMethods());
    }
    return app;
  }
  const root = new Router();
  controllers.forEach((controller) => {
    const { prefix = "", router } = routers.get(new controller()) ?? {};
    router && root.use(prefix, router.routes(), router.allowedMethods());
  });
  return app.use(root.routes());
  */

  controllers.forEach((controller) => {
    const impl = new controller();
    const { prefix = "", router } = routers.get(impl) ?? {};
    if (!router) return;
    prefix && router.prefix(prefix);
    router && app.use(router.routes(), router.allowedMethods());
  });
  return app;
};

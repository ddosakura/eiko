export * from "./deps.ts";

import { wrap } from "./deps.ts";

// https://deno.land/manual@v1.20.5/runtime/workers#using-deno-in-worker
export type PermissionOptions = Exclude<
  Parameters<typeof Deno.test>[0]["permissions"],
  undefined
>;
// --unstable is required.
export interface DenoWorkerOptions {
  namespace?: boolean;
  permissions?: PermissionOptions;
}

// For workers using local modules; --allow-read permission is required.
// For workers using remote modules; --allow-net permission is required.
// specifier: e.g. new URL("./worker.js", import.meta.url).href
export const run = <T = unknown>(
  specifier: string | URL,
  options?: DenoWorkerOptions,
) => {
  const worker = new Worker(
    specifier,
    options
      ? {
        type: "module",
        deno: options,
      } as WorkerOptions
      : {
        type: "module",
      },
  );

  const remote = wrap<T>(worker);
  return {
    worker,
    remote,
    terminate: () => worker.terminate(),
  };
};

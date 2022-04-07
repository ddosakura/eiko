import * as io from "https://deno.land/std@0.133.0/io/mod.ts";

export * as oak from "https://deno.land/x/oak@v10.5.1/mod.ts";
export type { ResponseBody as OakResponseBody } from "https://deno.land/x/oak@v10.5.1/response.ts";

declare global {
  type Buffer = io.Buffer;
}

import * as io from "https://deno.land/std@0.133.0/io/mod.ts";

declare global {
  type Buffer = io.Buffer;
}

// https://deno.land/std/uuid
export * as uuid from "https://deno.land/std@0.134.0/uuid/mod.ts";
// const myUUID = crypto.randomUUID();
// const isValid = v4.validate(myUUID);

// https://deno.land/x/oak
export * as oak from "https://deno.land/x/oak@v10.5.1/mod.ts";
export type { ResponseBody as OakResponseBody } from "https://deno.land/x/oak@v10.5.1/response.ts";

// https://github.com/harrisiirak/cron-parser
export { default as cron } from "https://esm.sh/cron-parser@4.3.0";

// https://github.com/GoogleChromeLabs/comlink
// https://unpkg.com/comlink/dist/esm/comlink.mjs
export * as Comlink from "https://esm.sh/comlink@4.3.1/dist/esm/comlink.mjs";

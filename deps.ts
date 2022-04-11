import * as io from "https://deno.land/std@0.133.0/io/mod.ts";
export { io };
declare global {
  type Buffer = io.Buffer;
}

export * as base64 from "https://deno.land/std@0.134.0/encoding/base64.ts";

// https://deno.land/std/uuid
export * as uuid from "https://deno.land/std@0.134.0/uuid/mod.ts";
// const myUUID = crypto.randomUUID();
// const isValid = v4.validate(myUUID);

// https://deno.land/x/oak
export * as oak from "https://deno.land/x/oak@v10.5.1/mod.ts";
export type { ResponseBody as OakResponseBody } from "https://deno.land/x/oak@v10.5.1/response.ts";

export { basicAuth } from "https://deno.land/x/basic_auth@v1.0.1/mod.ts";

// https://deno.land/x/mongo
export {
  Bson,
  MongoClient,
  ObjectId,
} from "https://deno.land/x/mongo@v0.29.3/mod.ts";

// === tmp ===

export * as cron from "https://esm.sh/cron-parser@4.3.0";
export * as Comlink from "https://esm.sh/comlink@4.3.1/dist/esm/comlink.mjs";

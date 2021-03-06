import * as io from "https://deno.land/std@0.134.0/io/mod.ts";
export { io };
declare global {
  type Buffer = io.Buffer;
}

export * as path from "https://deno.land/std@0.134.0/path/mod.ts";

export * as base64 from "https://deno.land/std@0.134.0/encoding/base64.ts";

// https://deno.land/std/uuid
export * as uuid from "https://deno.land/std@0.134.0/uuid/mod.ts";
// const myUUID = crypto.randomUUID();
// const isValid = v4.validate(myUUID);

export { basicAuth } from "https://deno.land/x/basic_auth@v1.0.1/mod.ts";

// https://deno.land/x/mongo
export {
  Bson,
  MongoClient,
  ObjectId,
} from "https://deno.land/x/mongo@v0.29.3/mod.ts";

export const loadSecrets = async () => {
  return {
    mongo: {
      user: await Deno.readTextFile("/run/secrets/mongo-user"),
      pass: await Deno.readTextFile("/run/secrets/mongo-pass"),
    },
  };
};

// === tmp ===

// https://deno.land/x/oak
export * as oak from "https://deno.land/x/oak@v10.5.1/mod.ts";
export type { ResponseBody as OakResponseBody } from "https://deno.land/x/oak@v10.5.1/response.ts";

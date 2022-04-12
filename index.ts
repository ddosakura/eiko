import { serve } from "./framework/mod.ts";

const [argPort = "8080", path = "/web", storage = "/storage"] = Deno.args;
const port = parseInt(argPort, 10);

await serve(port, path, storage);

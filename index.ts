import { serve } from "./framework/mod.ts";

const [argPort] = Deno.args;
const port = parseInt(argPort, 10);

await serve(port);

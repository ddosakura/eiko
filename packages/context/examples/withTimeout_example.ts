import * as context from "@eiko/context/mod.ts";

const tooSlow = (
  ctx: context.Context,
  ms: number,
) => {
  return new Promise<void>((resolve, reject) => {
    const id = setTimeout((): void => {
      clearTimeout(id);
      resolve();
    }, ms);
    ctx.done().then(() => {
      clearTimeout(id);
      reject(ctx.err());
    });
  });
};

const ctx = context.background();
const tctx = context.withTimeout(ctx, 1000); // timeout by 1000ms

try {
  await Promise.race([
    tooSlow(tctx, 3000), // take 3s
    tooSlow(tctx, 4000), // take 4s
    tooSlow(tctx, 5000), // take 5s
  ]);
} catch (e) {
  // Get this error by 1000ms.
  // DeadlineExceeded: context deadline exceeded
  console.warn("catch", e);
} finally {
  tctx.cancel(); // To prevent leak.
}

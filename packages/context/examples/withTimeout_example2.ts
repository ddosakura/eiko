import * as context from "@eiko/context/mod.ts";
import { select, sleep } from "@eiko/shared/mod.ts";

const handle = (ctx: context.Context, duration: number) =>
  select(
    [ctx.done(), () => console.log("handle", ctx.err())],
    [sleep(duration), () => console.log("process request with", duration)],
  );

const ctx = context.withTimeout(context.background(), 1000);

handle(ctx, 500);
await select(
  [ctx.done(), () => console.log("main", ctx.err())],
);

ctx.cancel();

/* Example

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()

    go handle(ctx, 500*time.Millisecond)
    select {
    case <-ctx.Done():
        fmt.Println("main", ctx.Err())
    }
}

func handle(ctx context.Context, duration time.Duration) {
    select {
    case <-ctx.Done():
        fmt.Println("handle", ctx.Err())
    case <-time.After(duration):
        fmt.Println("process request with", duration)
    }
}
*/

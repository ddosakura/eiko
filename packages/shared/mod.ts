export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));

// deno-lint-ignore no-explicit-any
export type SelectCase<T = any> = [Promise<T>, (v: T) => void];
export const select = async (...cases: SelectCase[]) => {
  const { index, data } = await Promise.race(
    cases.map(([p], index) => p.then((data) => ({ index, data }))),
  );
  return cases[index][1](data);
};

import { oak } from "deps";
import { transfer } from "@eiko/worker/mod.ts";

export type RawRequest = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: Uint8Array;
};

export const toRawRequest = async (
  input: RequestInfo,
  rawInit?: RequestInit,
): Promise<RawRequest> => {
  const nobody = ["GET", "HEAD"].includes(
    rawInit?.method ?? (typeof input === "string" ? "GET" : input.method),
  );
  const { body: _, ...init } = rawInit ?? {};
  const req = new Request(input, nobody ? init : rawInit);
  const base = {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  };
  if (nobody) return base;
  const data = new Uint8Array(await req.arrayBuffer()); // (await resp.body?.getReader().read())?.value;
  return {
    ...base,
    body: data ? transfer(data, [data.buffer]) : undefined,
  };
};

export type RawResponse = {
  status: oak.Status;
  headers?: Record<string, string>;
  body?: Uint8Array;
};

export const toRawResponse = async (body: string | Response) => {
  const resp = typeof body === "string" ? new Response(body) : body;
  const data = new Uint8Array(await resp.arrayBuffer()); // (await resp.body?.getReader().read())?.value;
  return {
    status: resp.status,
    headers: Object.fromEntries(resp.headers.entries()),
    body: data ? transfer(data, [data.buffer]) : undefined,
  };
};

export const toResponse = (resp: RawResponse) =>
  new Response(resp.body, {
    status: resp.status ?? 200,
    headers: new Headers(resp.headers ?? {}),
  });

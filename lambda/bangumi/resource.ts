//
// 2. 过滤
// 3. 下载-转储-切片

import { ObjectId } from "deps";
import type { Lambda } from "@eiko/serverless/mod.ts";

export interface Resource {
  title: string;
  pubDate: number;
  url: string;
}

// 单集
export interface ResourceSchema extends Resource {
  _id: ObjectId;
  cid: ObjectId;
  // 同步完成
  sync: boolean;
}
// 合集
export interface CollectionSchema {
  _id: ObjectId;
  name: string;
  searchKey: string;
  reFilter: string;
}
// 系列
export interface SeriesSchema {
  _id: ObjectId;
  name: string;
  cid: ObjectId;
}

export abstract class ResourceManager {
  protected name: string;
  protected lambda: Lambda;
  constructor(name: string, lambda: Lambda) {
    this.name = name;
    this.lambda = lambda;
  }

  // 1. 查询
  abstract search(): Promise<Resource[]>;

  // 2. [过滤]
  // 3. [下载]
  // 4. 转储
  // 5. [切片]
}

import { loadSecrets, MongoClient, ObjectId } from "deps";
import {
  CollectionSchema,
  ResourceSchema,
} from "../lambda/bangumi/resource.ts";

const { mongo: { user, pass } } = await loadSecrets();
const client = new MongoClient();
await client.connect(`mongodb://${user}:${pass}@mongo:27017`);
const db = client.database("lambda-bangumi");
const resources = db.collection<ResourceSchema>("resources");
const collections = db.collection<CollectionSchema>("collections");

const cids: string[] = ['6256da33557c54e77153832d', '6256e7ad557c54e771538415', '6256f04b4bda6c748ff4e5ab', '6256f1ba4bda6c748ff4e616', '6256f2ac4bda6c748ff4e65a', '6256f3104bda6c748ff4e67a', '6256f3c74bda6c748ff4e69b'];

await Promise.all(cids.map(async (cid) => {
  const _id = new ObjectId(cid);
  await collections.deleteOne({ _id });
  await resources.deleteMany({ cid: _id });
}));

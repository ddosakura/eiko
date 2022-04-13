import { loadSecrets, MongoClient } from "deps";
import { ResourceSchema } from "../lambda/bangumi/resource.ts";

const { mongo: { user, pass } } = await loadSecrets();
const client = new MongoClient();
await client.connect(`mongodb://${user}:${pass}@mongo:27017`);
const db = client.database("lambda-bangumi");
const resources = db.collection<ResourceSchema>("resources");

const aria2Id = "4b14c1472530519a";
const newKey = "a5";

{
  // const result = await resources.updateOne(
  //   { aria2Id },
  //   { $set: { files: { [newKey]: "b" } } },
  // );
  // console.log(result);

  // const result = await resources.findAndModify(
  //   { aria2Id },
  //   {
  //     update: {
  //       $set: {
  //         files: { [newKey]: "b" },
  //       },
  //     },
  //   },
  // );
  // console.log(result);

  const result = await resources.updateOne(
    { aria2Id },
    { $set: { [`files.${newKey}`]: "c" } },
  );
  console.log(result);
}

{
  // const result = await resources.updateOne(
  //   { aria2Id },
  //   { $set: { hls: { [newKey]: true } } },
  // );
  // console.log(result);

  const result = await resources.updateOne(
    { aria2Id },
    { $set: { [`hls.${newKey}`]: true } },
  );
  console.log(result);
}

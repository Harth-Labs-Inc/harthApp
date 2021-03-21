import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const createTopic = (db, data) => {
    return new Promise((resolve, reject) => {
      db.collection("topics").insertOne(data, function (err, topicCreated) {
        if (err) {
        }
        resolve(topicCreated);
      });
    });
  };

  const { db } = await connectToDatabase();
  let getTopicResult = await createTopic(db, obj.topic);
  if (!getTopicResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getTopicResult.insertedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success", id: getTopicResult.insertedId });
};

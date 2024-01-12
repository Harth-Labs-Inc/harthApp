import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
const newrelic = require("newrelic");
import { authenticateUser } from "util/authMiddleware";

/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const createTopic = (db, data) => {
    return new Promise((resolve, reject) => {
      db.collection("topics").insertOne(
        { ...data, createdAt: new Date() },
        function (err, topicCreated) {
          if (err) {
          }
          if (process.env.NODE_ENV === "production") {
            const timestamp = new Date();
            newrelic.recordCustomEvent("TopicCreated", {
              harthId: data.comm_id,
              createdAt: timestamp.toISOString(),
              topicCreatorId: data.topic_creator_id,
              topicId: topicCreated.insertedId,
            });
          }
          resolve(topicCreated);
        }
      );
    });
  };

  const getSelectedHarth = (db, id) => {
    return new Promise((resolve) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectId(id);
      db.collection("communities")
        .find({ _id: o_id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let selectedHarth = await getSelectedHarth(db, obj.topic.comm_id);
  if (!selectedHarth || !selectedHarth.users) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  obj.topic.members = selectedHarth.users.map((usr) => {
    return { ...usr, user_id: usr.userId };
  });
  let getTopicResult = await createTopic(db, obj.topic);
  if (!getTopicResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getTopicResult.insertedId) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success", id: getTopicResult.insertedId });
};

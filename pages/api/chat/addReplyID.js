import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import { authenticateUser } from "util/authMiddleware";

/* eslint-disable */

export default async (req, res) => {
  let authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  let { replyId, ownerId, isReply } = obj;

  const pushToMessage = (db, replyId, ownerId) => {
    return new Promise((resolve) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(ownerId);
      let collecton = isReply ? "replies" : "messages";
      db.collection(collecton).updateMany(
        { _id: o_id },
        { $push: { replies: replyId } },
        function (err, attchAdded) {
          if (err) {
            resolve(false);
          }
          resolve(attchAdded);
        }
      );
    });
  };

  const client = await getClientWithCheck(clientPromise);

  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let getResult = await pushToMessage(db, replyId, ownerId);
  if (!getResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getResult.modifiedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

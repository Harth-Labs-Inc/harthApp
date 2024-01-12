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

  const createMessage = (db, data) => {
    return new Promise((resolve, reject) => {
      db.collection("replies").insertOne(data, function (err, msgCreated) {
        if (err) {
        }
        resolve(msgCreated);
      });
    });
  };

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let insertResult = await createMessage(db, obj.msg);
  if (!insertResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!insertResult.insertedId) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success", id: insertResult.insertedId });
};

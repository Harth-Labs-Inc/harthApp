import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import { authenticateUser } from "util/authMiddleware";

/* eslint-disable */

export default async (req, res) => {
  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  let { id, name, fileType, desiredHeight, desiredWidth } = obj;

  const pushToMessage = (
    db,
    id,
    name,
    fileType,
    desiredHeight,
    desiredWidth
  ) => {
    return new Promise((resolve) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectId(id);
      db.collection("messages").updateMany(
        { _id: o_id },
        {
          $push: {
            attachments: { name, fileType, desiredHeight, desiredWidth },
          },
        },
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

  let getResult = await pushToMessage(
    db,
    id,
    name,
    fileType,
    desiredHeight,
    desiredWidth
  );
  if (!getResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getResult.modifiedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

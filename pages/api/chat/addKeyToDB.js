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
  let { id, name, fileType, desiredHeight, desiredWidth, isLastImage } = obj;

  const pushToMessage = (
    db,
    id,
    name,
    fileType,
    desiredHeight,
    desiredWidth,
    isLastImage
  ) => {
    return new Promise((resolve) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectId(id);
      let updateOperation = {
        $push: {
          attachments: { name, fileType, desiredHeight, desiredWidth },
        },
      };
      if (isLastImage) {
        updateOperation["$set"] = { status: "", pendingID: "" };
      }

      db.collection("messages").updateMany(
        { _id: o_id },
        updateOperation,
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
    desiredWidth,
    isLastImage
  );
  if (!getResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getResult.modifiedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

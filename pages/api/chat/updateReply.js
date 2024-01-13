import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { authenticateUser } from "util/authMiddleware";

/* eslint-disable */
const updateMessage = (db, msg) => {
  return new Promise((resolve, reject) => {
    let mongo = require("mongodb");
    let o_id = new mongo.ObjectId(msg._id);
    delete msg._id;
    db.collection("replies").replaceOne(
      { _id: o_id },
      msg,
      function (err, msgCreated) {
        if (err) {
          resolve(false);
        }
        resolve(msgCreated);
      }
    );
  });
};

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

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let updateResult = await updateMessage(db, obj.msg);
  if (!updateResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  return res.json({ ok: 1, msg: "success" });
};

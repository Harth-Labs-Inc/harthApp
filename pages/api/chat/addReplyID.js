import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  let { replyId, ownerId, isReply } = obj;

  const pushToMessage = (db, replyId, ownerId) => {
    return new Promise((resolve, reject) => {
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

  const { db } = await connectToDatabase();
  let getResult = await pushToMessage(db, replyId, ownerId);
  if (!getResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getResult.modifiedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

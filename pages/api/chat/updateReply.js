import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;

  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const updateMessage = (db, msg) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(msg._id);
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

  const { db } = await connectToDatabase();
  let updateResult = await updateMessage(db, obj.msg);
  if (!updateResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  return res.json({ ok: 1, msg: "success" });
};

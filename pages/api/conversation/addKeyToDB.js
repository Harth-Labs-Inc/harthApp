import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  let { id, name, fileType } = obj;

  const pushToMessage = (db, id, name, fileType) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("conversation_messages").updateMany(
        { _id: o_id },
        { $push: { attachments: { name, fileType } } },
        function (err, attchAdded) {
          if (err) {
            resolve(false);
          }
          resolve(attchAdded);
        }
      );
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let getResult = await pushToMessage(db, id, name, fileType);
  if (!getResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getResult.modifiedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

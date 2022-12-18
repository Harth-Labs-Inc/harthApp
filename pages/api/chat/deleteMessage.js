import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;

  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  console.log(obj.id);

  const deleteMessage = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("messages").remove(
        { _id: o_id },
        function (err, msgCreated) {
          if (err) {
            resolve(false);
          }
          resolve(msgCreated);
        }
      );
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let deleteResult = await deleteMessage(db, obj.id);
  if (!deleteResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  return res.json({ ok: 1, msg: "success" });
};

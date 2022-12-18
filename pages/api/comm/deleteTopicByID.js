import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;

  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  console.log(obj);

  const deleteTopic = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("topics").remove({ _id: o_id }, function (err, result) {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let deleteResult = await deleteTopic(db, obj.id);
  if (!deleteResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  return res.json({ ok: 1, msg: "success" });
};

import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  let { user, id } = obj;

  const pushToRoom = (db, user, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("rooms").updateOne(
        { _id: o_id },
        { $push: { active_users: user } },
        function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
        }
      );
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let getResult = await pushToRoom(db, user, id);
  if (!getResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getResult.modifiedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

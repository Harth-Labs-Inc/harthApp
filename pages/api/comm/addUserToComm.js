import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  console.log(obj);

  const createProf = (db, id, data) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("communities").updateOne(
        { _id: o_id },
        { $push: { users: data } },
        function (err, profCreated) {
          if (err) {
          }
          resolve(profCreated);
        }
      );
    });
  };

  const { db } = await connectToDatabase();
  let getProfResult = await createProf(db, obj.id, obj.prof);
  if (!getProfResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

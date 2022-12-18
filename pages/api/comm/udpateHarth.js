import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  console.log(obj);
  const harth = obj.data;

  const replaceTopic = (db, id, harth) => {
    console.log(id, harth);
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      delete harth._id;
      let newValues = {
        $set: {
          ...harth,
        },
      };
      db.collection("communities").updateOne(
        { _id: o_id },
        newValues,
        function (err) {
          if (err) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  };
  const client = await clientPromise;
  const db = client.db("blarg");

  let results = await replaceTopic(db, harth?._id, harth);

  if (!results) {
    return res.json({ ok: 0 });
  }
  return res.json({ msg: "update successful", ok: 1 });
};

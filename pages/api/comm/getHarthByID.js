import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const getHarth = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("communities")
        .find({ _id: o_id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          if (results[0]) {
            resolve(results[0]);
          } else {
            resolve(false);
          }
        });
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let fetchResults = await getHarth(db, obj.id);
  if (!fetchResults) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }
  return res.json({ msg: "successful", ok: 1, data: fetchResults });
};

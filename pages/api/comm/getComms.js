import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const getComms = (db, ids) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let oids = [];
      ids.forEach((id) => {
        oids.push(new mongo.ObjectID(id));
      });
      db.collection("communities")
        .find({ _id: { $in: oids } })
        .project({ invites: 0 })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
        });
    });
  };

  const { db } = await connectToDatabase();
  let comms = await getComms(db, obj.user.comms);
  if (!comms) {
    return res.json({ msg: "No User Found", ok: 0 });
  }
  return res.json({ msg: "comms found", ok: 1, comms: comms });
};

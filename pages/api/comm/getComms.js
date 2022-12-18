import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const findUser = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("users")
        .find({ _id: o_id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };

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

  const client = await clientPromise;
  const db = client.db("blarg");
  let user = await findUser(db, obj.user._id);
  if (!user) {
    return res.json({ msg: "No User Found", ok: 0 });
  }
  let comms = await getComms(db, user.comms);
  if (!comms) {
    return res.json({ msg: "No User Found", ok: 0 });
  }
  return res.json({ msg: "comms found", ok: 1, comms: comms });
};

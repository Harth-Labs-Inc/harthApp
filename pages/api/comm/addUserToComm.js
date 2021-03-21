import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const pushUserToComm = (db, id, data) => {
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

  const pushCommToUser = (db, userId, commId) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(userId);
      db.collection("users").updateOne(
        { _id: o_id },
        { $push: { comms: commId } },
        function (err, profCreated) {
          if (err) {
          }
          resolve(profCreated);
        }
      );
    });
  };

  const { db } = await connectToDatabase();
  let getProfResult = await pushUserToComm(db, obj.id, obj.prof);
  if (!getProfResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getProfResult.modifiedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  let getuserResult = await pushCommToUser(db, obj.prof.userId, obj.id);
  return res.json({ ok: 1, msg: "success" });
};

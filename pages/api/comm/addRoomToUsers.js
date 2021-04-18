import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  let { ids, room } = obj;

  const pushToRoom = (db, ids, room) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let objIds = [];
      ids.forEach((id) => {
        let o_id = new mongo.ObjectID(id);
        objIds.push(o_id);
      });
      console.log(ids, room);
      db.collection("users").updateMany(
        { _id: { $in: objIds } },
        { $push: { rooms: room } },
        function (err, RoomAdded) {
          if (err) {
            resolve(false);
          }
          resolve(RoomAdded);
        }
      );
    });
  };

  const { db } = await connectToDatabase();
  let getResult = await pushToRoom(db, ids, room);
  if (!getResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getResult.modifiedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

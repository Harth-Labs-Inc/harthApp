import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const pushToRoom = (db, id, room) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("users").updateOne(
        { _id: o_id },
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
  let getResult = await pushToRoom(db, obj.id, obj.room);
  if (!getResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getResult.modifiedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

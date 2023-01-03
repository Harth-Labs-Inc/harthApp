import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  const { harth, user } = obj;
  let harthID = harth?._id;
  let userID = user?._id || user?.userId;

  const deleteFromUser = (db, harthID, userID) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(userID);
      db.collection("users").updateOne(
        { _id: o_id },
        { $pull: { comms: harthID } },
        function (err, result) {
          if (err) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  };
  const deleteFromTopic = (db, harthID, userID) => {
    return new Promise((resolve, reject) => {
      db.collection("topics").updateMany(
        { comm_id: harthID },
        {
          $pull: {
            members: { $or: [{ userId: userID }, { user_id: userID }] },
          },
        },
        function (err, result) {
          if (err) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  };
  const deleteFromHarth = (db, harthID, userID) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(harthID);
      db.collection("communities").updateOne(
        { _id: o_id },
        {
          $pull: {
            users: { $or: [{ userId: userID }, { user_id: userID }] },
          },
        },
        function (err, result) {
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

  await deleteFromUser(db, harthID, userID);
  await deleteFromTopic(db, harthID, userID);
  await deleteFromHarth(db, harthID, userID);

  return res.json({ ok: 1, msg: "success" });
};

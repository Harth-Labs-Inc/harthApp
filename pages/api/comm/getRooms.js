import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  console.log(obj);
  const { commId, UserId } = obj;

  const getRooms = (db, id, usrId) => {
    return new Promise((resolve, reject) => {
      db.collection("rooms")
        .find({ comm_id: id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          console.log(results);
          resolve(results);
        });
    });
  };
  const { db } = await connectToDatabase();
  let rms = await getRooms(db, commId, UserId);

  return res.json({ msg: "rooms found", ok: 1, rms });
};

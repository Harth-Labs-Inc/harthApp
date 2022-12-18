import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  const { harthId } = obj;

  const getRooms = (db, id) => {
    return new Promise((resolve, reject) => {
      db.collection("rooms")
        .find({ harthId: id })
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
  let rms = await getRooms(db, harthId);

  return res.json({ msg: "rooms found", ok: 1, rms });
};

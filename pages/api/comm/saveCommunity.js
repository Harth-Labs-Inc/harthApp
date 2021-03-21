import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const createComm = (db, data) => {
    return new Promise((resolve, reject) => {
      db.collection("communities").insertOne(data, function (err, commCreated) {
        if (err) {
        }
        resolve(commCreated);
      });
    });
  };

  const { db } = await connectToDatabase();
  let getCommResult = await createComm(db, obj.comm);
  if (!getCommResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getCommResult.insertedCount) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success", id: getCommResult.insertedId });
};

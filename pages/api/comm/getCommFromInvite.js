import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const findComm = (db, tkn) => {
    return new Promise((resolve, reject) => {
      db.collection("communities")
        .find({ invites: tkn })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };

  const { db } = await connectToDatabase();
  let comm = await findComm(db, obj.id);
  if (!comm) {
    return res.json({ msg: "token has expired or invalid token", ok: 0 });
  }
  return res.json({ msg: "update successful", ok: 1, comm });
};

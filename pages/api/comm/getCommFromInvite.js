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
      db.collection("invites")
        .find({ token: tkn })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          if (results[0]) {
            if (new Date() < new Date(results[0].expiration)) {
              resolve(results[0]);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
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

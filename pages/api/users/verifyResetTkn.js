import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const findUser = (db, tkn) => {
    return new Promise((resolve, reject) => {
      db.collection("users")
        .find({
          resetPasswordToken: tkn,
          resetPasswordExpires: { $gt: Date.now() },
        })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let user = await findUser(db, obj.tkn);
  if (!user) {
    return res.json({ msg: "No User Found", ok: 0 });
  }
  return res.json({ msg: "token ok", ok: 1 });
};

import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  console.log(obj, "asdf");
  const findUser = (db, user) => {
    return new Promise((resolve, reject) => {
      db.collection("users")
        .find({
          email: user.email,
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
  let user = await findUser(db, obj.newUser);
  if (!user || !user.otp || !obj.inviteCode) {
    return res.json({ msg: "no user found", ok: 0 });
  }
  if (user.otp != obj.inviteCode) {
    return res.json({ msg: "invalid code", ok: 0 });
  }

  return res.json({ msg: "success", ok: 1 });
};

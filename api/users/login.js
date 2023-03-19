import clientPromise from "../../../util/mongodb";
import jwt from "jsonwebtoken";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const findUser = (db, email) => {
    return new Promise((resolve, reject) => {
      db.collection("users")
        .find({ email: { $regex: email, $options: "i" } })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };

  const saveUser = (db, user) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectId(user._id);
      delete user._id;
      db.collection("users").updateOne(
        { _id: o_id },
        { $set: { ...user } },
        function (err, res) {
          resolve(res);
        }
      );
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let user = await findUser(db, obj.email);
  if (!user) {
    return res.json({ msg: "No User Found", ok: 0 });
  }
  let userToken = user.token;
  if (!userToken || new Date() > new Date(user.token_expiration)) {
    let token = jwt.sign({ userId: user._id.toString() }, process.env.SECRET);
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    userToken = token;
    user.token = token;
    user.token_expiration = date;
  }
  user.otp_expiration = new Date();
  await saveUser(db, { ...user });

  return res.json({ msg: "login successful", tkn: userToken, ok: 1 });
};

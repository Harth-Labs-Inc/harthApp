import clientPromise from "../../../util/mongodb";
import jwt from "jsonwebtoken";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const findUser = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("users")
        .find({ _id: o_id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };
  const decode = (tokn) => {
    return new Promise((resolve, reject) => {
      resolve(jwt.verify(tokn, process.env.SECRET));
    });
  };

  let decodedToken = await decode(obj.token);
  if (!decodedToken) res.json({ msg: "Invalid Token", ok: 0 });

  let { userId } = decodedToken;
  if (!userId) res.json({ msg: "Invalid Token", ok: 0 });

  //  const client = await clientPromise;

  const client = await clientPromise;
  const db = client.db("blarg");

  let user = await findUser(db, userId);
  if (!user) {
    return res.json({ msg: "No User Found", ok: 0 });
  }
  if (user.token != obj.token) {
    return res.json({ msg: "bad token", ok: 0 });
  }
  if (new Date() > new Date(user.token_expiration)) {
    return res.json({ msg: "expired token", ok: 0 });
  }

  return res.json({ msg: "user found", user, ok: 1 });
};

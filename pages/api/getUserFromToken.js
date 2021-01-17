import { connectToDatabase } from "../../util/mongodb";
import jwt from "jsonwebtoken";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  console.log("obj", obj);
  const findUser = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      console.log(o_id);
      db.collection("users")
        .find({ _id: o_id })
        .project({ password: 0 })
        .toArray(function (err, results) {
          if (err) {
            console.log(err);
          }
          console.log(results);
          resolve(results[0]);
        });
    });
  };
  const decode = (tokn) => {
    return new Promise((resolve, reject) => {
      resolve(
        jwt.verify(
          tokn,
          "alakjsdhfklajdhfluaiwehyrjasbdfclnbclvbjlsadhfliashyriuewhasjkdfskfhalksdhbflahlajdbflaksjdfhlasfheaihalsjdhsjfhfhaiwhfljfsdlkfjhaslfhweuilhjdflawhefliuwhsdfljhsflhweslfhwlifglfhlawjhfliuawehugflasjbxbcxxbvnmcbvsjdkfhgsliudtyreioudfjg"
        )
      );
    });
  };

  let decodedToken = await decode(obj.token);
  if (!decodedToken) res.json({ msg: "invalid token", ok: 0 });

  let { userId } = decodedToken;
  if (!userId) res.json({ msg: "invalid token", ok: 0 });

  const { db } = await connectToDatabase();
  let user = await findUser(db, userId);
  console.log(user);
  return res.json({ msg: "user found", user, ok: 1 });
};

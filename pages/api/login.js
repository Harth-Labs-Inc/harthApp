import { connectToDatabase } from "../../util/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  console.log(obj);
  const findUser = (db, email) => {
    return new Promise((resolve, reject) => {
      db.collection("users")
        .find({ email: email })
        .toArray(function (err, results) {
          if (err) {
            console.log(err);
          }
          resolve(results[0]);
        });
    });
  };
  const comparePwd = (hashedpw, pw) => {
    return new Promise((resolve, reject) => {
      resolve(bcrypt.compare(pw, hashedpw));
    });
  };

  const { db } = await connectToDatabase();
  let user = await findUser(db, obj.email);
  if (!user) {
    return res.json({ msg: "No user Found" });
  }
  console.log(user);
  let isEqual = await comparePwd(user.password, obj.password);
  if (!isEqual) {
    return res.json({ msg: "passwords do not match", ok: 0 });
  }
  console.log(process.env.MONGODB_DB);
  let token = jwt.sign(
    { userId: user._id.toString() },
    "alakjsdhfklajdhfluaiwehyrjasbdfclnbclvbjlsadhfliashyriuewhasjkdfskfhalksdhbflahlajdbflaksjdfhlasfheaihalsjdhsjfhfhaiwhfljfsdlkfjhaslfhweuilhjdflawhefliuwhsdfljhsflhweslfhwlifglfhlawjhfliuawehugflasjbxbcxxbvnmcbvsjdkfhgsliudtyreioudfjg"
  );
  console.log(token);
  return res.json({ msg: "login successful", tkn: token, ok: 1 });
};

import { connectToDatabase } from "../../../util/mongodb";
import bcrypt from "bcrypt";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const createUser = (db, data) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(data.password, 12, function (err, hash) {
        delete data.password;
        delete data.conf_password;
        db.collection("users").insertOne(
          { ...data, password: hash, comms: [] },
          function (err, userCreated) {
            if (err) {
            }
            resolve(userCreated);
          }
        );
      });
    });
  };

  const chkExistingUser = (db, email) => {
    return new Promise((resolve, reject) => {
      db.collection("users")
        .find({ email: email })
        .toArray(function (err, results) {
          if (err) {
          }
          resolve(results);
        });
    });
  };

  const { db } = await connectToDatabase();
  let chkExistingUserResult = await chkExistingUser(db, obj.email);
  if (chkExistingUserResult && chkExistingUserResult.length > 0) {
    res.json({ exists: true });
  } else {
    let getUserResult = await createUser(db, obj);
    res.json({ exists: false });
  }
};

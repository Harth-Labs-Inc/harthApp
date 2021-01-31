import { connectToDatabase } from "../../../util/mongodb";
import { Validator } from "node-input-validator";
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

  const v = new Validator(obj, {
    email: "required|email",
    password: "required|minLength:8",
  });

  const matched = await v.check();
  if (!matched) {
    let errors = {};
    for (let [key, value] of Object.entries(v.errors)) {
      errors[key] = value.message;
    }
    return res.json({ ok: 0, errors });
  }

  const { db } = await connectToDatabase();
  let chkExistingUserResult = await chkExistingUser(db, obj.email);
  if (chkExistingUserResult && chkExistingUserResult.length > 0) {
    return res.json({ ok: 1, msg: "" });
  } else {
    let getUserResult = await createUser(db, obj);
    return res.json({ ok: 0, errors: { match: "Email Already Exists" } });
  }
};

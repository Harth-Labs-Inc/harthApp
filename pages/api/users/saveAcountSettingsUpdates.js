import clientPromise from "../../../util/mongodb";
import { Validator } from "node-input-validator";

export default async (req, res) => {
  let obj;

  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const updateUser = (db, id, field, value) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("users").updateMany(
        { _id: o_id },
        { $set: { [field]: value } },
        function (err, msgCreated) {
          if (err) {
            resolve(false);
          }
          resolve(msgCreated);
        }
      );
    });
  };
  const chkExistingUser = (db, email) => {
    return new Promise((resolve, reject) => {
      db.collection("users")
        .find({ email: { $regex: email, $options: "i" } })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          if (results.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");

  if (obj.field == "email") {
    const v = new Validator(obj, {
      value: "required|email",
    });
    let matched = await v.check();
    if (!matched) {
      return res.json({ ok: 0, msg: "Invalid Email" });
    }
    let chkExistingUserResult = await chkExistingUser(db, obj.value);
    if (chkExistingUserResult) {
      return res.json({ ok: 0, msg: "Email Already Exists" });
    }
  }

  let updateResult = await updateUser(db, obj.id, obj.field, obj.value);
  if (!updateResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  return res.json({ ok: 1, msg: "success" });
};

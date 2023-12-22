import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { Validator } from "node-input-validator";

/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const chkExistingUser = (db, email) => {
    return new Promise((resolve, reject) => {
      db.collection("users")
        .find({ email: { $regex: `^${email}$`, $options: "i" } })
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

  const v = new Validator(obj, {
    email: "required|email",
  });

  const matched = await v.check();
  if (!matched) {
    let errors = {};
    for (let [key, value] of Object.entries(v.errors)) {
      errors[key] = value.message;
    }
    return res.json({ ok: 0, errors });
  }

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  let chkExistingUserResult = await chkExistingUser(db, obj.email);
  if (chkExistingUserResult) {
    return res.json({ ok: 0, errors: { match: "Email Already Exists" } });
  } else {
    return res.json({ ok: 1 });
  }
};

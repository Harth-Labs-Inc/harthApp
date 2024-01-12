import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
const newrelic = require("newrelic");
import { Validator } from "node-input-validator";
import { generateOTP } from "../../../services/helper";

/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  const createUser = (db, data) => {
    return new Promise((resolve, reject) => {
      db.collection("users").insertOne(
        { ...data, comms: [], rooms: [], joinedAt: new Date() },
        function (err, userCreated) {
          if (err) {
          }
          if (userCreated && userCreated.insertedId) {
            if (process.env.NODE_ENV === "production") {
              const timestamp = new Date();
              newrelic.recordCustomEvent("UserCreated", {
                userId: userCreated.insertedId,
                createdAt: timestamp.toISOString(),
              });
            }
            resolve(userCreated.insertedId.toString());
          }
          resolve("");
        }
      );
    });
  };

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
    let otp = generateOTP();
    let today = new Date();
    let exp = new Date(today.getTime() + 15 * 60000);

    obj.otp = otp;
    obj.otp_expiration = new Date(exp);
    let id = await createUser(db, obj);
    return res.json({ ok: 1, msg: "", user: { ...obj, _id: id } });
  }
};

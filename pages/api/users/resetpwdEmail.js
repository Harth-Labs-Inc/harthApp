import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import crypto from "crypto";
import { envUrls } from "../../../constants/urls";

/* eslint-disable */

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
        .find({ email: { $regex: `^${email}$`, $options: "i" } })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };

  const updateUser = (db, email) => {
    return new Promise((resolve, reject) => {
      let token = crypto.randomBytes(20).toString("hex");
      let newValues = {
        $set: {
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 3600000,
        },
      };
      db.collection("users").updateOne(
        { email: email },
        newValues,
        function (err, res) {
          if (err) {
            resolve(false);
          } else {
            resolve(token);
          }
        }
      );
    });
  };

  const sendEmail = (email, token) => {
    return new Promise((resolve, reject) => {
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(process.env.SENDGRID_API);

      const baseURL =
        process.env.IS_QA_ENV === "true"
          ? envUrls.qa
          : envUrls[process.env.NODE_ENV] || envUrls.development;

      const msg = {
        to: email,
        from: process.env.GMAIL_EMAIL,
        subject: "reset pasword",
        html: `
        <p>You recently requested to reset your password for your Blarg account. Use the button below to reset it. <b>This password reset is only valid for the next hour</b></p>
        <a href='${baseURL}?reset=true&tkn=${token}'>Reset Your Password</a>
        `,
      };

      sgMail
        .send(msg)
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  };

  const client = await getClientWithCheck(clientPromise);

  const db = client.db("blarg");
  let user = await findUser(db, obj.email);
  if (!user) {
    return res.json({ msg: "Email Not Found", ok: 0 });
  }
  let tkn = await updateUser(db, obj.email);
  if (!tkn) {
    return res.json({
      msg: "Something Went Wrong, PLease try again",
      ok: 0,
    });
  }
  let email = await sendEmail(obj.email, tkn);
  if (!email) {
    return res.json({
      msg: "Something Went Wrong, PLease try again",
      ok: 0,
    });
  }
  return res.json({ msg: "email sent", ok: 1 });
};

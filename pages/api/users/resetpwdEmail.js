import { connectToDatabase } from "../../../util/mongodb";
import nodemailer from "nodemailer";
import crypto from "crypto";

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
        .find({ email: email })
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
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_PWD,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: email,
        subject: "reset pasword",
        html: `
        <p>You recently requested to reset your password for your Blarg account. Use the button below to reset it. <b>This password reset is only valid for the next hour</b></p>
        <a href='http://localhost:3000/?reset=true&tkn=${token}'>Reset Your Password</a>
        `,
      };
      transporter.sendMail(mailOptions, function (err, res) {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  };

  const { db } = await connectToDatabase();
  let user = await findUser(db, obj.email);
  if (!user) {
    return res.json({ msg: "Email Not Found", ok: 0 });
  }
  let tkn = await updateUser(db, obj.email);
  if (!tkn) {
    return res.json({ msg: "Something Went Wrong, PLease try again", ok: 0 });
  }
  let email = await sendEmail(obj.email, tkn);
  if (!email) {
    return res.json({ msg: "Something Went Wrong, PLease try again", ok: 0 });
  }
  return res.json({ msg: "email sent", ok: 1 });
};

import { connectToDatabase } from "../../../util/mongodb";
import { Validator } from "node-input-validator";
import nodemailer from "nodemailer";
import crypto from "crypto";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  console.log(obj);

  const pushInviteToComm = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      let token = crypto.randomBytes(20).toString("hex");
      db.collection("communities").updateOne(
        { _id: o_id },
        { $push: { invites: token } },
        function (err, profCreated) {
          if (err) {
            resolve(false);
          }
          resolve(token);
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
      console.log(email, process.env.GMAIL_EMAIL);
      const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: email,
        subject: "invite",
        html: `
        <p>you've been invited to a community</p>
        <a href='${process.env.NODE_ENV}/?invite=true&tkn=${token}'>Go to Project blarg</a>
        `,
      };
      transporter.sendMail(mailOptions, function (err, res) {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          resolve(true);
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

  const { db } = await connectToDatabase();
  let tkn = await pushInviteToComm(db, obj.id);
  if (!tkn) {
    return res.json({
      ok: 0,
      errors: { custom: "Something Went Wrong, PLease try again" },
    });
  }
  let email = await sendEmail(obj.email, tkn);
  if (!email) {
    return res.json({
      ok: 0,
      errors: { custom: "Something Went Wrong, PLease try again" },
    });
  }
  return res.json({ msg: "email sent", ok: 1 });
};

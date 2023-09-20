import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Validator } from "node-input-validator";

import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import { envUrls } from "../../../constants/urls";

/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

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

  const sendEmail = (email, token, note) => {
    return new Promise((resolve, reject) => {
      let URLS = envUrls;
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(process.env.SENDGRID_API);

      const msg = {
        to: email,
        from: process.env.GMAIL_EMAIL,
        subject: "invite",
        html: `
         <p>you've been invited to a community</p>
        <p>to join either copy and paste this <strong>${token}</strong> as the invite link or click link below</p>
       <a href='${
         URLS[process.env.NODE_ENV]
       }?invite=true&tkn=${token}'>Go to Project blarg</a>
        <p>${note}</P>
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

  // authentication ---------------------------------
  const findUser = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("users")
        .find({ _id: o_id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };
  const decode = (tokn) => {
    return new Promise((resolve, reject) => {
      resolve(jwt.verify(tokn, process.env.SECRET));
    });
  };
  let authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }
  let decodedToken = await decode(authToken);
  if (!decodedToken) {
    return res.json({ msg: "bad token", ok: 0, lockDown: true });
  }
  let { userId } = decodedToken;
  if (!userId) {
    return res.json({ msg: "Invalid Token", ok: 0, lockDown: true });
  }
  let user = await findUser(db, userId);
  if (!user || !user.token || user == "undefined") {
    return res.json({ msg: "No User Found", ok: 0, lockDown: true });
  }
  if (user.token != authToken) {
    return res.json({ msg: "bad token", ok: 0, lockDown: true });
  }
  if (new Date() > new Date(user.token_expiration)) {
    return res.json({ msg: "expired token", ok: 0, lockDown: true });
  }
  // passed authentication ------------------------------------------

  let tkn = await pushInviteToComm(db, obj.id);
  if (!tkn) {
    return res.json({
      ok: 0,
      errors: { custom: "Something Went Wrong, PLease try again" },
    });
  }
  let email = await sendEmail(obj.email, tkn, obj.note);
  if (!email) {
    return res.json({
      ok: 0,
      errors: { custom: "Something Went Wrong, PLease try again" },
    });
  }
  return res.json({ msg: "email sent", ok: 1 });
};

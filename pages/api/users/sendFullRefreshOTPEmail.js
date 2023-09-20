import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import { generateOTP } from "../../../services/helper";
import jwt from "jsonwebtoken";
import { Validator } from "node-input-validator";
import AWS from "aws-sdk";

/* eslint-disable */

AWS.config = {
  accessKeyId: "AKIARIGZHATFWEQ2TU4K",
  secretAccessKey: "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",
  region: "us-east-1",
};

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

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
  const saveUser = (db, user) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectId(user._id);
      delete user._id;
      db.collection("users").updateOne(
        { _id: o_id },
        { $set: { ...user } },
        function (err, res) {
          resolve(res);
        }
      );
    });
  };
  const decode = (tokn) => {
    return new Promise((resolve, reject) => {
      resolve(jwt.verify(tokn, process.env.SECRET));
    });
  };
  const chkExistingUser = (db, email) => {
    return new Promise((resolve, reject) => {
      db.collection("users")
        .find({ email: email })
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
  const checkIfValidCode = (db, user) => {
    return new Promise((resolve) => {
      async function runCheck() {
        let getNewCode = true;
        if (user.otp_expiration) {
          let today = new Date();
          let otp_expiration = new Date(user.otp_expiration);
          if (otp_expiration > today) {
            getNewCode = false;
          }
        }
        if (getNewCode) {
          let otp = generateOTP();
          let today = new Date();
          let exp = new Date(today.getTime() + 15 * 60000);
          if (user.email == "test@harthsocial.com") {
            otp = "960323";
          }
          user.otp = otp;
          user.otp_expiration = new Date(exp);
          await saveUser(db, { ...user });
        }
        resolve(user);
      }
      runCheck();
    });
  };
  const sendEmail = (otp, email, subject) => {
    return new Promise((resolve, reject) => {
      let nodemailer = require("nodemailer");

      const transporter = nodemailer.createTransport({
        SES: new AWS.SES({
          apiVersion: "2010-12-1",
        }),
      });
      transporter.sendMail(
        {
          from: "noreply@harthapp.com",
          to: email,
          subject: subject,
          html: `  <div style="height: 600px; width: 355px; margin: 50px auto">
      <h3
        style="
          background: #2f1d2a;
          padding: 0%;
          height: 120px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: white;
          margin: 0;
        "
      >
        Harth
      </h3>
      <div style="">
        <p
          style="
            font-family: 'Work Sans';
            font-style: normal;
            font-weight: 600;
            font-size: 18px;
            line-height: 125%;

            /* identical to box height, or 22px */
            letter-spacing: 0.02em;

            /* Fuel */
            color: #2f1d2a;
          "
        >
          Your one-time passcode
        </p>
        <p
          style="
            font-family: 'Work Sans';
            font-style: normal;
            font-weight: 600;
            font-size: 28px;
            line-height: 125%;

            /* identical to box height, or 35px */
            text-align: center;
            letter-spacing: 0.02em;

            /* Fuel */
            color: #2f1d2a;
          "
        >
          ${otp}
        </p>
        <div
          style="
            font-family: 'Work Sans';
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 125%;

            /* or 15px */
            letter-spacing: 0.02em;

            /* Fuel */
            color: #2f1d2a;
          "
        >
          <p>This is a single use passcode and will expite in 15 minutes.</p>
          <p>
            If you did not make this request, please contact our help teem for
            further assistance.
          </p>
          <p>
            Need Assistance?
            <span
              style="
                text-decoration-line: underline;

                /* Hot Pink */
                color: #d96fab;
              "
            >
              Get Help</span
            >
          </p>
        </div>

        <div
          style="
            font-family: 'Work Sans';
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 125%;

            /* or 15px */
            letter-spacing: 0.02em;

            /* Fuel 50 */
            color: rgba(47, 29, 42, 0.5);
          "
        >
          <p>
            This email was send to .Please do not reply to this email. This
            address is not monitored
          </p>
          <div style="display: flex; justify-content: space-between">
            <a>www.harthapp.com</a><a>Terms of Service</a>
          </div>
        </div>
      </div>
    </div>`,
          text: `one time password is ${otp}`,
        },
        (mailErr, info) => {
          if (mailErr) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  };

  //check token
  let decodedToken = await decode(obj.token);
  if (!decodedToken) {
    return;
  }
  let { userId } = decodedToken;

  if (!userId) {
    return res.json({ msg: "Invalid Token", ok: 0, lockDown: true });
  }
  const client = await getClientWithCheck(clientPromise);

  const db = client.db("blarg");
  //check user
  let user = await findUser(db, userId);
  if (!user || !user.token || user == "undefined") {
    return res.json({ msg: "No User Found", ok: 0, lockDown: true });
  }
  if (user?.token != obj.token) {
    return res.json({ msg: "bad token", ok: 0, lockDown: true });
  }
  if (new Date() > new Date(user.token_expiration)) {
    return res.json({ msg: "expired token", ok: 0, lockDown: true });
  }
  //check new email
  const v = new Validator(obj, { email: "required|email" });
  let matched = await v.check();
  if (!matched) {
    return res.json({ ok: 0, msg: "Invalid Email" });
  }
  let chkExistingUserResult = await chkExistingUser(db, obj.email);
  if (chkExistingUserResult) {
    return res.json({ ok: 0, msg: "Email Already Exists" });
  }
  //check if valid or reset OTP
  let newUser = await checkIfValidCode(db, user);
  if (!newUser) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  //send email
  let sent = await sendEmail(newUser.otp, obj.email, "Email Verification");
  if (!sent) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success" });
};

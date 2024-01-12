import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
const nodemailer = require("nodemailer");
import AWS from "aws-sdk";
import { envUrls } from "../../../constants/urls";
const newrelic = require("newrelic");

AWS.config = {
  accessKeyId: "AKIARIGZHATFWEQ2TU4K",
  secretAccessKey: "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",
  region: "us-east-1",
};

const generateToken = (
  email,
  selectedHarth,
  senderID,
  senderName = "",
  iconKey = ""
) => {
  const dateSuffix = new Date().toISOString().replace(/[^0-9]/g, "");
  const expirationDate = new Date();
  expirationDate.setUTCDate(expirationDate.getUTCDate() + 2);

  const token = jwt.sign(
    {
      email,
      dateSuffix,
      id: selectedHarth._id,
      expirationDate,
      senderID,
      senderName,
      iconKey,
    },
    process.env.SECRET
  );

  return {
    invite_tkn: token,
    invite_expiration: expirationDate,
    email,
    senderID,
    senderName,
    iconKey,
  };
};

const saveInvite = (db, data, invites) => {
  return new Promise((resolve) => {
    const o_id = new ObjectId(data._id);
    delete data._id;

    const query = { _id: o_id };
    const updateOperation = {
      $addToSet: { invitesArray: { $each: invites || [] } },
    };

    db.collection("communities").updateOne(
      query,
      updateOperation,
      { upsert: true },
      function (err, results) {
        if (err) {
          resolve(false);
        }
        resolve(results);
      }
    );
  });
};

const sendInvitationEmail = (email, token, name, harthID) => {
  const baseURL =
    process.env.IS_QA_ENV === "true"
      ? envUrls.qa
      : envUrls[process.env.NODE_ENV] || envUrls.development;

  const mailOptions = {
    from: "Härth Social <noreply@harthapp.com>",
    to: email,
    subject: "Invitation to Join",
    html: `

    <div style="width: 355px; padding: 24px 12px; margin-left: auto; margin-right: auto; background: #ffffff;">
          <div
            style="
              width: 100%;
              padding: 0;
              padding-top: 24px;
              padding-bottom: 24px;
              text-align: center;
              margin: 0;
              background: #2f1d2a;
            "
          >
              <img 
                src="https://images.squarespace-cdn.com/content/6324af2b1cf55f7c7acccaa1/985d2269-17fb-4e14-9125-da3a0d86339c/Ha%CC%88rth-Logo-Light.png?content-type=image%2Fpng" 
                alt="Harth Logo"
                style="
                  padding: 0;
                  height: 36px;
                  margin-left: auto;
                  margin-right: auto;
                "
              />
          </div>

          <p
            style="
              font-style: normal;
              font-weight: 600;
              font-size: 1.4em;
              letter-spacing: 0.02em;
              color: #2f1d2a;
              text-align: center;
              padding-top: 24px;
              padding-bottom: 12px;
            "
          >
            You have been invited to join<br />
            ${name}
          </p>
        <p
        style="
              background: #aa68c8;
              padding: 10px 0px;
              width: 180px;
              border-radius: 99px;
              text-align: center;
              margin-left: auto;
              margin-right: auto;
            "
          ><a href="${baseURL}?invite=true&tkn=${token}"
        
            style="
              font-style: normal;
              font-size: 16px;
              letter-spacing: 0.02em;
              color: #ffffff;
              text-decoration: none;
            ">
          Join Now</a></p>
          <p
            style="
              font-style: normal;
              font-size: .9em;
              letter-spacing: 0.02em;
              color: #7a7a7a;
              text-align: center;
            ">
            _This invite will expire in 48hrs_
            <br />
            <br />
            </p>
          <span
            style="
              font-style: normal;
              font-size: .9em;
              letter-spacing: 0.02em;
              color: #7a7a7a;
              text-align: left;
            ">
            If you did not request this email, you can safely ignore it. Please do not reply to this email. This address is not monitored
          </span>
          <br />
          <br />
          <a 
          href="https://www.harthsocial.com"
          style="
            font-style: normal;
            font-size: .9em;
            letter-spacing: 0.02em;
            color: #7a7a7a;
          ">
          www.harthsocial.com
        </a>
        <br />
        <br />
          <br />
          <a 
            style="
              font-style: normal;
              font-size: .9em;
              letter-spacing: 0.02em;
              color: #7a7a7a;
              text-align: left;
            "
            href="https://www.harthsocial.com/terms">Terms of Service</a>
          <br />
          <p
            style="
              font-style: normal;
              font-size: .9em;
              letter-spacing: 0.02em;
              color: #7a7a7a;
              text-align: left;
            "> ©2023 Harth Labs Inc. All rights reserved.</p>
          </div>
        
      `,
  };

  const transporter = nodemailer.createTransport({
    SES: new AWS.SES({
      apiVersion: "2010-12-1",
    }),
  });

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        if (process.env.NODE_ENV === "production") {
          const timestamp = new Date();
          newrelic.recordCustomEvent("InviteSent", {
            harthID: harthID,
            createdAt: timestamp.toISOString(),
            receiverEmail: email,
          });
        }
        resolve(info);
      }
    });
  });
};

export default async (req, res) => {
  let errorMsg = "";

  const obj = req.body === "string" ? JSON.parse(req.body) : req.body;

  const { selectedHarth, enteredEmails, profile } = obj.data;

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  // Authentication
  const { userId } =
    jwt.verify(req.headers["x-auth-token"], process.env.SECRET) || {};

  const user =
    userId &&
    (await db.collection("users").findOne({ _id: new ObjectId(userId) }));

  if (
    !req.headers["x-auth-token"] ||
    !user ||
    user.token !== req.headers["x-auth-token"] ||
    new Date() > new Date(user.token_expiration)
  ) {
    errorMsg = "Invalid Token or No User Found or Expired Token.";
    return res.status(401).json({ msg: errorMsg, ok: 0 });
  }

  // Authentication end
  const blockedUsers = await db
    .collection("users")
    .find({
      BlockedList: { $elemMatch: { userId: userId } },
    })
    .toArray();

  const blockedEmails = blockedUsers.map((userDoc) =>
    userDoc.email.toLowerCase()
  );

  const filteredEmails = enteredEmails.filter(
    (email) => !blockedEmails.includes(email.toLowerCase())
  );

  const tokens = filteredEmails.map((email) =>
    generateToken(email, selectedHarth, userId, profile?.name, profile?.iconKey)
  );
  await saveInvite(db, selectedHarth, tokens);

  Promise.all(
    tokens.map(({ invite_tkn, email }) =>
      sendInvitationEmail(
        email,
        invite_tkn,
        selectedHarth.name,
        selectedHarth._id
      )
    )
  );

  return res.json({
    msg: errorMsg || "successful",
    ok: errorMsg ? 0 : 1,
  });
};

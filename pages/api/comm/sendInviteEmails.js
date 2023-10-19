import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
const nodemailer = require("nodemailer");
import AWS from "aws-sdk";
import { envUrls } from "../../../constants/urls";

AWS.config = {
  accessKeyId: "AKIARIGZHATFWEQ2TU4K",
  secretAccessKey: "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",
  region: "us-east-1",
};

const generateToken = (email, selectedHarth) => {
  const dateSuffix = new Date().toISOString().replace(/[^0-9]/g, "");
  const expirationDate = new Date();
  expirationDate.setUTCDate(expirationDate.getUTCDate() + 2);

  const token = jwt.sign(
    { email, dateSuffix, id: selectedHarth._id, expirationDate },
    process.env.SECRET
  );

  return { invite_tkn: token, invite_expiration: expirationDate, email };
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

const sendInvitationEmail = (email, token) => {
  const URLS = envUrls;

  const mailOptions = {
    from: "Härth Social <noreply@harthapp.com>",
    to: email,
    subject: "Invitation to Join",
    html: `
        <p>You've been invited to join our community!</p>
        <p><a href="${
          URLS[process.env.NODE_ENV]
        }?invite=true&tkn=${token}">Join Now</a></p>
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
        console.error("Error sending invitation email:", error);
        reject(error);
      } else {
        console.log("Invitation email sent:", info.response);
        resolve(info);
      }
    });
  });
};

export default async (req, res) => {
  let errorMsg = "";

  const obj = req.body === "string" ? JSON.parse(req.body) : req.body;

  const { selectedHarth, enteredEmails } = obj.data;

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
    return res.json({ msg: errorMsg, ok: 0 });
  }

  // Authentication end

  const tokens = enteredEmails.map((email) =>
    generateToken(email, selectedHarth)
  );
  await saveInvite(db, selectedHarth, tokens);

  Promise.all(
    tokens.map(({ invite_tkn, email }) =>
      sendInvitationEmail(email, invite_tkn)
    )
  );

  return res.json({
    msg: errorMsg || "successful",
    ok: errorMsg ? 0 : 1,
  });
};

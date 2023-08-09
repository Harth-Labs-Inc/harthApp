import AWS from "aws-sdk";
AWS.config = {
  accessKeyId: "AKIARIGZHATFWEQ2TU4K",
  secretAccessKey: "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",
  region: "us-east-1",
};

/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { user, subject } = obj;
  const { otp, email } = user;
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
          from: "Härth Social <noreply@harthapp.com>",
          to: email,
          subject: subject,
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
            <a 
              href=""
              style="
                font-style: normal;
                font-size: .8em;
                letter-spacing: 0.02em;
                color: #7a7a7a;
              ">
              www.harthsocial.com
            </a>
            <br />
            <br />
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
            "
          >
            Your one-time passcode
          </p>
          <p
            style="
              font-style: normal;
              font-weight: 700;
              font-size: 3em;
\             text-align: center;
              letter-spacing: 0.2em;
              color: #2f1d2a;
            "
          >
            ${otp}
          </p>

          <span
            style="
              font-style: normal;
              font-size: .9em;
              letter-spacing: 0.02em;
              color: #7a7a7a;
              text-align: left;
            ">
            This is a single use passcode and will expire in 15 minutes.
            <br />
            <br />
            If you did not request this email, you can safely ignore it. Please do not reply to this email. This address is not monitored
          </span>
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

        </div>`,
          text: `one time password is ${otp}`,
        },
        (mailErr, info) => {
          if (mailErr) {
            console.log(mailErr, "mailerror");
            resolve(mailErr);
          }
          resolve(info);
        }
      );
    });
  };
  await sendEmail(otp, email, subject);
  return res.json({ msg: "login successful", ok: 1 });
};

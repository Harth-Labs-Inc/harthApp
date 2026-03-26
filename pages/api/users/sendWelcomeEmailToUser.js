import AWS from "aws-sdk";
AWS.config = {
  accessKeyId: "",
  secretAccessKey: "",
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
          from: "noreply@harthapp.com",
          to: email,
          subject: subject,
          html: ` 
          
          <div style="width: 355px; padding: 24px 12px; margin-left: auto; margin-right: auto; background: #ffffff;">
          <div
            style="
              width: 100%;
              padding: 0;
              padding-top: 0px;
              padding-bottom: 0px;
              text-align: center;
              margin: 0;
            "
          >
              <img 
                src="https://images.squarespace-cdn.com/content/6324af2b1cf55f7c7acccaa1/3d8ba910-0421-4be9-bb6b-a1612ea3ef61/email_splash.png?content-type=image%2Fpng" 
                alt="Harth Logo"
                style="
                  padding: 0;
                  width: 355px;
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
          Welcome to Härth
          </p>
              
          <span
            style="
              font-style: normal;
              font-size: 1em;
              letter-spacing: 0.02em;
              color: #2f1d2a;
              text-align: left;
            ">
              You have successfully registered for an account with the following address: ${email}
              <br /><br />
              We are thrilled to welcome you to Härth, our innovative take on social that creates 
              a private space for you and your friends.
              <br /><br />
              <span style="font-weight: 600;">Providing Feedback:</span> Email <a href="mailto:help@harthsocial.com">help@harthsocial.com</a> if you want 
              to send us any feedback or if we experience any issues. 
              <br /> <br />
              Best,<br/>
              The Härth Team
          </span>
            <br />
            <div
              style="
              font-style: normal;
              font-size: .9em;
              letter-spacing: 0.02em;
              color: #7a7a7a;
              text-align: left;
            ">
              This email was sent to ${email}. Please do not reply to this email. This
              address is not monitored.

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
          </div>`,
        },
        (mailErr, info) => {
          if (mailErr) {
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

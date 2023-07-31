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
          from: "noreply@harthapp.com",
          to: email,
          subject: subject,
          html: `  <div style="height: 600px; width: 355px; margin: 50px auto">
            <div style="">
              <p
                style="
                  font-family: 'Work Sans';
                  font-style: normal;
                  font-weight: 600;
                  font-size: 18px;
                  line-height: 125%;
                  letter-spacing: 0.02em;
                  /* Fuel */
                  color: #2f1d2a;
                "
              >
                Welcome to Härth
              </p>
              <div
                style="
                  font-family: 'Work Sans';
                  font-style: normal;
                  font-weight: 400;
                  font-size: 12px;
                  line-height: 125%;
                  letter-spacing: 0.02em;

                  /* Fuel */
                  color: #2f1d2a;
                "
              >
                <p>You have successfully registered for an account with the following address: ${email}</p>
                <p>
                  We are thrilled to welcome you as one of the first beta testers for Härth, our innovative take on social
                  that creates a private space for you and your friends. Your valuable feedback and insights will help us
                  fine-tune the experience and ensure that we launch a top-notch product.
                </p>
                <p style="
                  font-weight: 600;
                  ">
                  Here's what you need to know to get started:
                  <ul>
                    <li><span style="font-weight: 600;">Accessing Härth:</span> We recommend that you install Härth as a PWA (Progressive
                      Web App). This is especially important if you are using the app on your mobile device. Don't worry, it's really easy.
                      Visit <a href="https://www.harthsocial.com/pwa">https://www.harthsocial.com/pwa</a> for instrucstions </li>
                    <li><span style="font-weight: 600;">Providing Feedback:</span> Email <a href="mailto:help@harthsocial.com">
                    help@harthsocial.com</a> if you want to send us any feedback or if we experience any issues. When 
                    reporting bugs, please include a detailed description, screenshots or screen recordings (if applicable),
                    and the steps you took leading up to the issue.</li>
                  </ul>
                </p>
                <p>We are excited to embark on this journey with you and look forward to receiving your valuable feedback.
                Together, we'll make Härth the best it can be. Thank you for your support and happy testing!</p>
                <p>Warm Regards,<br/>
                The Härth Team</p>
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
                  This email was sent to ${email}. Please do not reply to this email. This
                  address is not monitored
                </p>
                <div style="display: flex; justify-content: space-between">
                  <a href="https://www.harthsocial.com">www.harthsocial.com</a><a href="https://www.harthsocial.com/terms">Terms of Service</a>
                </div>
              </div>
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

import AWS from "aws-sdk";
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

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

  const {
    collectedData,
    userFeedback,
    screenshotBase64,
    imageFormat,
    userName,
  } = obj;

  const sendEmail = (
    collectedData,
    userFeedback,
    screenshotBase64,
    imageFormat,
    userName
  ) => {
    const emailHTML = `
        <h2>User Feedback</h2>
        <p>${userFeedback}</p>
    
        <h2>Collected Data</h2>
        <table border="1" cellpadding="10" cellspacing="0">
          <thead>
            <tr>
              <th>Data Point</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(collectedData)
              .map(([key, value]) => {
                if (typeof value === "object" && value !== null) {
                  return Object.entries(value)
                    .map(
                      ([subKey, subValue]) => `
                  <tr>
                    <td>${key} - ${subKey}</td>
                    <td>${subValue}</td>
                  </tr>
                `
                    )
                    .join("");
                } else {
                  return `
                  <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                  </tr>
                `;
                }
              })
              .join("")}
          </tbody>
        </table>
      `;

    const attachments = [];
    if (screenshotBase64) {
      attachments.push({
        filename: `screenshot.${imageFormat}`,
        content: screenshotBase64,
        encoding: "base64",
      });
    }
    const mailOptions = {
      from: "Härth Social <noreply@harthapp.com>",
      to: ["phil@harthsocial.com", "help@harthapp.com"],
      subject: `Feedback: ${userName}`,
      html: emailHTML,
      attachments: attachments,
    };
    return new Promise((resolve, reject) => {
      let nodemailer = require("nodemailer");

      const transporter = nodemailer.createTransport({
        SES: new AWS.SES({
          apiVersion: "2010-12-1",
        }),
      });

      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.log(mailErr, "mailerror");
          resolve(mailErr);
        }
        resolve(info);
      });
    });
  };

  await sendEmail(
    collectedData,
    userFeedback,
    screenshotBase64,
    imageFormat,
    userName
  );
  return res.json({ msg: "successful", ok: 1 });
};

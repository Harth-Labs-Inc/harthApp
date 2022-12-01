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

    const { otp, email } = obj;
    console.log(obj, otp, email, "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
    const sendEmail = (otp, email) => {
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
                    to: "jorge.piquer@harthapp.com",
                    subject: "test",
                    html: `<p>one time password is ${otp}</p>`,
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
    await sendEmail(otp, email);
    return res.json({ msg: "login successful", ok: 1 });
};

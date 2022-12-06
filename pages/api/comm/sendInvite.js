import { connectToDatabase } from "../../../util/mongodb";
import { Validator } from "node-input-validator";
import crypto from "crypto";

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
            let urls = {
                test: `http://localhost:3000`,
                development: "http://localhost:3000/",
                production: "https://harth.vercel.app/",
            };
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
           urls[process.env.NODE_ENV]
       }?invite=true&tkn=${token}'>Go to Project blarg</a>
        <p>${note}</P>
        `,
            };

            sgMail
                .send(msg)
                .then(() => {
                    console.log("Email sent");
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

    const { db } = await connectToDatabase();
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

import { connectToDatabase } from "../../../util/mongodb";
import { generateOTP } from "../../../services/helper";

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const findUser = (db, email) => {
        return new Promise((resolve, reject) => {
            db.collection("users")
                .find({ email: email })
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
            console.log(user);
            db.collection("users").updateOne(
                { _id: o_id },
                { $set: { ...user } },
                function (err, res) {
                    console.log(res);
                    resolve(res);
                }
            );
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
                    let tomorrow = today.setDate(today.getDate() + 1);
                    user.otp = otp;
                    user.otp_expiration = new Date(tomorrow);
                    await saveUser(db, user);
                }
                resolve(user);
            }
            runCheck();
        });
    };

    const { db } = await connectToDatabase();
    let user = await findUser(db, obj.email);
    if (!user) {
        return res.json({ msg: "No User Found", ok: 0 });
    }

    let newUser = await checkIfValidCode(db, user);

    return res.json({ msg: "user found", ok: 1, user: newUser });
};

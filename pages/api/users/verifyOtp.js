import clientPromise from "../../../util/mongodb";

/* eslint-disable */

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const findUser = (db, user) => {
        return new Promise((resolve, reject) => {
            db.collection("users")
                .find({
                    email: user.email,
                })
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
            db.collection("users").updateOne(
                { _id: o_id },
                { $set: { ...user } },
                function (err, res) {
                    resolve(res);
                }
            );
        });
    };

    const client = await clientPromise;
    const db = client.db("blarg");

    let user = await findUser(db, obj.newUser);
    if (!user || !user.otp || !obj.inviteCode) {
        return res.json({ msg: "no user found", ok: 0 });
    }
    if (user.otp != obj.inviteCode) {
        return res.json({ msg: "invalid code", ok: 0 });
    }

    if (new Date() > new Date(user.otp_expiration)) {
        return res.json({ msg: "expired token", ok: 0 });
    }

    user.otp_expiration = new Date();
    await saveUser(db, { ...user });

    return res.json({ msg: "success", ok: 1 });
};

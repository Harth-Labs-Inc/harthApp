import clientPromise from "../../../util/mongodb";
import bcrypt from "bcrypt";

/* eslint-disable */

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const findUser = (db, tkn) => {
        return new Promise((resolve, reject) => {
            db.collection("users")
                .find({
                    resetPasswordToken: tkn,
                    resetPasswordExpires: { $gt: Date.now() },
                })
                .toArray(function (err, results) {
                    if (err) {
                        resolve(false);
                    }
                    resolve(results[0]);
                });
        });
    };

    const updateUser = (db, user, pwd) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(pwd, 12, function (err, hash) {
                let mongo = require("mongodb");
                let o_id = new mongo.ObjectID(user._id);
                let newValues = {
                    ...user,
                };
                newValues._id = o_id;
                newValues.password = hash;
                delete newValues.resetPasswordExpires;
                delete newValues.resetPasswordToken;
                db.collection("users").replaceOne(
                    { _id: o_id },
                    newValues,
                    function (err, res) {
                        if (err) {
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    }
                );
            });
        });
    };

    const client = await clientPromise;
    const db = client.db("blarg");
    let user = await findUser(db, obj.tkn);
    if (!user) {
        return res.json({ msg: "token has expired or invalid token", ok: 0 });
    }
    let update = await updateUser(db, user, obj.password);
    if (!update) {
        return res.json({ msg: "something went wrong", ok: 0 });
    }
    return res.json({ msg: "update successful", ok: 1 });
};

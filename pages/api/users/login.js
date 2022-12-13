import { connectToDatabase } from "../../../util/mongodb";
import jwt from "jsonwebtoken";

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

    const { db } = await connectToDatabase();
    let user = await findUser(db, obj.email);
    if (!user) {
        return res.json({ msg: "No User Found", ok: 0 });
    }

    let token = jwt.sign({ userId: user._id.toString() }, process.env.SECRET);
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    user.token = token;
    user.token_expiration = date;
    await saveUser(db, { ...user });

    return res.json({ msg: "login successful", tkn: token, ok: 1 });
};

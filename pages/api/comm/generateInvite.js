import { connectToDatabase } from "../../../util/mongodb";
import jwt from "jsonwebtoken";

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const { _id } = obj;

    const saveInvite = (db, data) => {
        return new Promise((resolve, reject) => {
            let mongo = require("mongodb");
            let o_id = new mongo.ObjectID(data._id);
            delete data._id;
            db.collection("communities").updateOne(
                { _id: o_id },
                { $set: { ...data } },
                function (err, results) {
                    if (err) {
                        resolve(false);
                    }
                    resolve(results);
                }
            );
        });
    };
    const { db } = await connectToDatabase();
    let token = jwt.sign({ comm_id: _id.toString() }, process.env.SECRET);
    let date = new Date();
    let tempExpiration = new Date(date.setDate(date.getDate() + 2));
    obj.invite_tkn = token;
    obj.invite_expiration = tempExpiration;
    let saveResult = await saveInvite(db, { ...obj });
    if (!saveResult) {
        return res.json({ msg: "Something went wrong", ok: 0 });
    }
    return res.json({ msg: "successful", ok: 1, user: obj });
};

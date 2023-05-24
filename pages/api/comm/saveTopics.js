import clientPromise from "../../../util/mongodb";
import jwt from "jsonwebtoken";

/* eslint-disable */

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const createTopic = (db, data) => {
        return new Promise((resolve, reject) => {
            db.collection("topics").insertOne(
                data,
                function (err, topicCreated) {
                    if (err) {
                    }
                    resolve(topicCreated);
                }
            );
        });
    };

    const getSelectedHarth = (db, id) => {
        return new Promise((resolve) => {
            let mongo = require("mongodb");
            let o_id = new mongo.ObjectId(id);
            db.collection("communities")
                .find({ _id: o_id })
                .toArray(function (err, results) {
                    if (err) {
                        resolve(false);
                    }
                    resolve(results[0]);
                });
        });
    };

    const client = await clientPromise;
    const db = client.db("blarg");

    // authentication ---------------------------------
    const findUser = (db, id) => {
        return new Promise((resolve, reject) => {
            let mongo = require("mongodb");
            let o_id = new mongo.ObjectID(id);
            db.collection("users")
                .find({ _id: o_id })
                .toArray(function (err, results) {
                    if (err) {
                        resolve(false);
                    }
                    resolve(results[0]);
                });
        });
    };
    const decode = (tokn) => {
        return new Promise((resolve, reject) => {
            resolve(jwt.verify(tokn, process.env.SECRET));
        });
    };
    let authToken = req.headers["x-auth-token"];
    if (!authToken) {
        return res.json({ msg: "No token Found", ok: 0, lockDown: true });
    }
    let decodedToken = await decode(authToken);
    if (!decodedToken) {
        return res.json({ msg: "bad token", ok: 0, lockDown: true });
    }
    let { userId } = decodedToken;
    if (!userId) {
        return res.json({ msg: "Invalid Token", ok: 0, lockDown: true });
    }
    let user = await findUser(db, userId);
    if (!user || !user.token || user == "undefined") {
        return res.json({ msg: "No User Found", ok: 0, lockDown: true });
    }
    if (user.token != authToken) {
        return res.json({ msg: "bad token", ok: 0, lockDown: true });
    }
    if (new Date() > new Date(user.token_expiration)) {
        return res.json({ msg: "expired token", ok: 0, lockDown: true });
    }
    // passed authentication ------------------------------------------
    let selectedHarth = await getSelectedHarth(db, obj.topic.comm_id);
    if (!selectedHarth || !selectedHarth.users) {
        return res.json({ ok: 0, msg: "something went wrong" });
    }

    obj.topic.members = selectedHarth.users.map((usr) => {
        return { ...usr, user_id: usr.userId };
    });
    let getTopicResult = await createTopic(db, obj.topic);
    if (!getTopicResult) {
        return res.json({ ok: 0, msg: "something went wrong" });
    }
    if (!getTopicResult.insertedId) {
        return res.json({ ok: 0, msg: "something went wrong" });
    }
    return res.json({ ok: 1, msg: "success", id: getTopicResult.insertedId });
};

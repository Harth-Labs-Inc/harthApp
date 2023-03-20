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

    const pushUserToComm = (db, id, data) => {
        return new Promise((resolve, reject) => {
            let mongo = require("mongodb");
            let o_id = new mongo.ObjectID(id);
            db.collection("communities").updateOne(
                { _id: o_id },
                { $push: { users: data } },
                function (err, results) {
                    if (err) {
                        resolve(false);
                    }
                    resolve(results);
                }
            );
        });
    };

    const pushCommToUser = (db, userId, commId) => {
        return new Promise((resolve, reject) => {
            let mongo = require("mongodb");
            let o_id = new mongo.ObjectID(userId);
            db.collection("users").updateOne(
                { _id: o_id },
                { $push: { comms: commId } },
                function (err, results) {
                    if (err) {
                        console.error(err);
                        resolve(false);
                    }
                    resolve(results);
                }
            );
        });
    };

    const getPublicTopicsForComm = (db, commId) => {
        return new Promise((resolve, reject) => {
            db.collection("topics")
                .find({ comm_id: commId, private: { $ne: true } })
                .toArray(function (err, results) {
                    if (err) {
                        console.error(err);
                        resolve(false);
                    }
                    resolve(results);
                });
        });
    };

    const addRoomsToUser = (db, userId, ids) => {
        return new Promise((resolve, reject) => {
            let mongo = require("mongodb");
            let o_id = new mongo.ObjectID(userId);
            db.collection("users").updateOne(
                { _id: o_id },
                { $push: { rooms: { $each: ids } } },
                function (err, results) {
                    if (err) {
                        resolve(false);
                    }
                    resolve(results);
                }
            );
        });
    };

    const addMemberToTopics = (db, user, ids) => {
        return new Promise((resolve, reject) => {
            let mongo = require("mongodb");
            let objIds = [];
            ids.forEach((id) => {
                let o_id = new mongo.ObjectID(id);
                objIds.push(o_id);
            });

            let memberObj = {
                ...user,
                user_id: user.userId,
                admin: false,
                muted: false,
            };

            db.collection("topics").updateMany(
                { _id: { $in: objIds } },
                { $push: { members: memberObj } },
                function (err, results) {
                    if (err) {
                        resolve(false);
                    }
                    resolve(results);
                }
            );
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
    ///////////
    let getProfResult = await pushUserToComm(db, obj.id, obj.prof);

    if (!getProfResult) {
        return res.json({ ok: 0, msg: "something went wron,pushUserToComm" });
    }

    let getuserResult = await pushCommToUser(db, obj.prof.userId, obj.id);

    if (!getuserResult) {
        return res.json({ ok: 0, msg: "something went wrong,pushCommToUser" });
    }

    if (!getuserResult.modifiedCount) {
        return res.json({
            ok: 0,
            msg: "something went wrong,getuserResult.modifiedCount",
        });
    }

    //////////
    let topics = await getPublicTopicsForComm(db, obj.id);

    if (!topics) {
        return res.json({ ok: 0, msg: "something went wrong,!topics" });
    }
    //////////
    let topicIds = topics.map((topic) => topic._id.toString());
    await addRoomsToUser(db, obj.prof.userId, topicIds);
    await addMemberToTopics(db, obj.prof, topicIds);

    return res.json({ ok: 1, msg: "success" });
};

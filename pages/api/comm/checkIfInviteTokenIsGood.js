import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import sendCustomNewRelicEvent from "util/saveNewRelicEvent";

/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  let { token, user, isAccepting } = obj.data;

  const findHarth = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
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
  const decode = (tokn) => {
    return new Promise((resolve, reject) => {
      resolve(jwt.verify(tokn, process.env.SECRET));
    });
  };

  let decodedToken = await decode(token);
  if (!decodedToken) res.json({ msg: "Invalid Token", ok: 0 });

  let { id, senderID, senderName, iconKey } = decodedToken;

  if (!id) res.json({ msg: "Invalid Token", ok: 0 });
  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  let harth = await findHarth(db, id);

  if (!harth || !harth.invitesArray) {
    return res.json({ msg: "No Harth Found", ok: 0 });
  }
  if (!user || !user.email) {
    return res.json({ msg: "No user Found", ok: 0 });
  }

  let match = harth.invitesArray.find(
    ({ invite_tkn, email }) =>
      token === invite_tkn && user.email.toLowerCase() === email.toLowerCase()
  );

  if (!match) {
    return res.json({ msg: "bad token", ok: 0 });
  }
  if (new Date() > new Date(match.invite_expiration)) {
    return res.json({ msg: "expired token", ok: 0 });
  }
  let userAlreadyInHarth = harth.users.find((usr) => usr.userId == user._id);
  if (userAlreadyInHarth) {
    return res.json({ msg: "already in harth", ok: 0 });
  }

  if (isAccepting && process.env.NODE_ENV === "production") {
    const timestamp = new Date();
    sendCustomNewRelicEvent({
      data: {
        recieverId: user._id,
        createdAt: timestamp.toISOString(),
        senderId: senderID,
      },
      title: "InviteAccepted",
    });
  }

  return res.json({
    msg: "All good!",
    ok: 1,
    harth,
    sender: { senderID, senderName, iconKey },
  });
};

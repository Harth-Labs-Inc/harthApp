import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import jwt from "jsonwebtoken";
import webpush from "web-push";
/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const getHarth = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectId(id);
      db.collection("communities")
        .find({ _id: o_id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          if (results[0]) {
            resolve(results[0]);
          } else {
            resolve(false);
          }
        });
    });
  };
  const getSubscriptions = (db, ids) => {
    return new Promise((resolve, reject) => {
      db.collection("subscriptions")
        .find({ userId: { $in: ids } })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
        });
    });
  };

  const client = await getClientWithCheck(clientPromise);

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
    return res
      .status(401)
      .json({ msg: "No User Found", ok: 0, lockDown: true });
  }
  if (user.token != authToken) {
    return res.status(401).json({ msg: "bad token", ok: 0, lockDown: true });
  }
  if (new Date() > new Date(user.token_expiration)) {
    return res
      .status(401)
      .json({ msg: "expired token", ok: 0, lockDown: true });
  }
  // passed authentication ------------------------------------------

  let fetchedHarth = await getHarth(db, obj.data.comm_id);
  if (!fetchedHarth) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }

  const { users } = fetchedHarth;
  if (!users || !users.length) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }

  let ids = users.map((user) => user.userId);
  if (!ids || !ids.length) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }

  const subscriptions = await getSubscriptions(db, ids);
  if (!subscriptions || !subscriptions.length) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }
  webpush.setVapidDetails(
    "mailto:phil@harthsocial.com",
    "BLmVZKPUxgCfITiXnsBehXwxHGXXOhDoTSBsQYgEu21Gn6kTicS0viMLkjpyAiP5ewX9xS-jQ3GreXB3-eO0tMA",
    "Vwf1mmSKmiAsG6rGqVGWttghTQzRMyzAsHoNkvw4G_g"
  );
  subscriptions.forEach(async ({ sub, userId }) => {
    let pushConfig = {
      endpoint: sub.endpoint,
      keys: sub.keys,
    };
    webpush.sendNotification(
      pushConfig,
      JSON.stringify({
        title: `New message from ${obj.data.creator_name}`,
        content: `${obj.data.message}`,
        openUrl: "/",
      })
    );
  });

  return res.json({ ok: 1, msg: "success" });
};

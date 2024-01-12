import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import jwt from "jsonwebtoken";

/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { commId, UserId } = obj;

  const getTopics = (db, id, usrId) => {
    return new Promise((resolve, reject) => {
      db.collection("topics")
        .find({
          comm_id: id,
          members: { $elemMatch: { user_id: usrId } },
        })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }

          let filteredTopics = results.sort((a, b) => {
            const removeEmoji = (str) => {
              return str
                .replace(
                  /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                  ""
                )
                .replace(/\s+/g, " ")
                .trim();
            };
            const nameA = removeEmoji(a.title);
            const nameB = removeEmoji(b.title);

            if (nameA.toLowerCase() < nameB.toLowerCase()) {
              return -1;
            }
            if (nameA.toLowerCase() > nameB.toLowerCase()) {
              return 1;
            }

            return 0;
          });
          resolve(filteredTopics);
        });
    });
  };

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  let authToken = req.headers["x-auth-token"];
  if (!authToken) {
    await db.command({ ping: 1 });
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

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

  let topics = await getTopics(db, commId, UserId);

  return res.json({ msg: "topics found", ok: 1, topics: topics });
};

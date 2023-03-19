import clientPromise from "../../../util/mongodb";
import jwt from "jsonwebtoken";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { commId, UserId } = obj;

  const getRooms = (db, id, usrId) => {
    return new Promise((resolve, reject) => {
      db.collection("rooms")
        .find({ comm_id: id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
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

  let rms = await getRooms(db, commId, UserId);

  return res.json({ msg: "rooms found", ok: 1, rms });
};

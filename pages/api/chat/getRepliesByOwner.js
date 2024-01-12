import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import { authenticateUser } from "util/authMiddleware";

/* eslint-disable */

export default async (req, res) => {
  let authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const getMsgs = (db, id) => {
    return new Promise((resolve) => {
      db.collection("replies")
        .find({ owner_id: id })
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
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let fetchResults = await getMsgs(db, obj.id);
  if (!fetchResults) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }
  return res.json({ msg: "successful", ok: 1, fetchResults });
};

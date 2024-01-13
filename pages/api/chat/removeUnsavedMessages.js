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

  const deleteMessage = (db, topicid, userid) => {
    return new Promise((resolve) => {
      db.collection("unread_messages").deleteMany(
        { user_id: userid, topic_id: topicid },
        function (err, msgCreated) {
          if (err) {
            resolve(false);
          }
          resolve(msgCreated);
        }
      );
    });
  };

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let deleteResult = await deleteMessage(db, obj.topicid, obj.userid);
  if (!deleteResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  return res.json({ ok: 1, msg: "success" });
};

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

  const updateMessage = (db, harthID, userID, icon) => {
    return new Promise((resolve, reject) => {
      db.collection("messages").updateMany(
        { comm_id: harthID, creator_id: userID },
        { $set: { creator_image: icon } },
        function (err, msgCreated) {
          if (err) {
            resolve(false);
          }
          resolve(msgCreated);
        }
      );
    });
  };

  const updateUnreadMessages = (db, harthID, userID, icon) => {
    return new Promise((resolve, reject) => {
      db.collection("unread_messages").updateMany(
        { comm_id: harthID, creator_id: userID },
        { $set: { creator_image: icon } },
        function (err, result) {
          if (err) {
            resolve(false);
          }
          resolve(result);
        }
      );
    });
  };

  const updateUnreadConvMessages = (db, harthID, userID, icon) => {
    return new Promise((resolve, reject) => {
      db.collection("unread_conv_messages").updateMany(
        { comm_id: harthID, creator_id: userID },
        { $set: { creator_image: icon } },
        function (err, result) {
          if (err) {
            resolve(false);
          }
          resolve(result);
        }
      );
    });
  };

  const updateConversation = (db, harthID, userID, icon) => {
    return new Promise((resolve, reject) => {
      db.collection("conversation_messages").updateMany(
        { comm_id: harthID, creator_id: userID },
        { $set: { creator_image: icon } },
        function (err, msgCreated) {
          if (err) {
            resolve(false);
          }
          resolve(msgCreated);
        }
      );
    });
  };

  const updateConversationUser = (db, harthID, userID, icon) => {
    return new Promise((resolve, reject) => {
      db.collection("conversations").updateMany(
        { harthId: harthID, "users.userId": userID },
        { $set: { "users.$.iconKey": icon } },
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

  try {
    await Promise.all([
      updateMessage(db, obj.id, obj.userID, obj.newImg),
      updateConversation(db, obj.id, obj.userID, obj.newImg),
      updateConversationUser(db, obj.id, obj.userID, obj.newImg),
      updateUnreadMessages(db, obj.id, obj.userID, obj.newImg),
      updateUnreadConvMessages(db, obj.id, obj.userID, obj.newImg),
    ]);

    return res.json({ ok: 1, msg: "success" });
  } catch (error) {
    console.error("Error during batch update:", error);
    return res.json({ ok: 0, msg: "An error occurred during updates" });
  }
};

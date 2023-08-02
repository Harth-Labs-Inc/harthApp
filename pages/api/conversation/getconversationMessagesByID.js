import clientPromise from "../../../util/mongodb";
import jwt from "jsonwebtoken";
import crypto from "crypto";
/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  const algorithm = "aes-256-cbc";
  const encryptionKey = Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY, "hex");
  const key = crypto.scryptSync(encryptionKey, "salt", 32);
  const iv = Buffer.alloc(16, 0);

  const getMsgs = async (db, id, page = 1, limit = 13) => {
    const skip = (page - 1) * limit;
    return await db
      .collection("conversation_messages")
      .find({ conversation_id: id })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  };

  const decrypt = async (data) => {
    const { encryptedMessage } = data;
    if (encryptedMessage) {
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
      decrypted += decipher.final("utf8");
      data.message = decrypted;
    }
    return data;
  };

  const decryptMessages = async (msgs) => {
    return await Promise.all(msgs.map((message) => decrypt(message)));
  };

  const client = await clientPromise;
  const db = client.db("blarg");

  // authentication ---------------------------------
  const findUser = (db, id) => {
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
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
    return res.json({ msg: "No User Found", ok: 0, lockDown: true });
  }
  if (user.token != authToken) {
    return res.json({ msg: "bad token", ok: 0, lockDown: true });
  }
  if (new Date() > new Date(user.token_expiration)) {
    return res.json({ msg: "expired token", ok: 0, lockDown: true });
  }
  // passed authentication ------------------------------------------

  let fetchResults = await getMsgs(db, obj.id, obj.page, obj.limit);
  if (!fetchResults) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }
  let decryptedMessages = await decryptMessages(fetchResults);
  return res.json({
    msg: "successful",
    ok: 1,
    fetchResults: decryptedMessages,
  });
};

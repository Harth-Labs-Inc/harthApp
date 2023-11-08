import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { ObjectId } from "mongodb";
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

  const getMsgs = async (db, id, page = 1, limit = 25, blockedList) => {
    const skip = (page - 1) * limit;
    return await db
      .collection("messages")
      .find({ topic_id: id, creator_id: { $nin: blockedList } })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  };

  const decrypt = (data) => {
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
    return msgs.map(decrypt);
  };

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  // Authentication
  let user;
  try {
    const decodedToken = jwt.verify(authToken, process.env.SECRET);
    const userId = decodedToken?.userId;
    if (!userId) {
      return res.json({ msg: "Invalid user ID", ok: 0, lockDown: true });
    }
    user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  } catch (error) {
    return res.json({ msg: "Invalid Token", ok: 0, lockDown: true });
  }

  if (
    !user ||
    user.token !== authToken ||
    new Date() > new Date(user.token_expiration)
  ) {
    return res.json({ msg: "Authentication failed", ok: 0, lockDown: true });
  }
  // Authentication end
  const blockedList = user?.BlockedList?.map((blocked) => blocked.userId) || [];

  let fetchResults = await getMsgs(
    db,
    obj.id,
    obj.page,
    obj.limit,
    blockedList
  );
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

import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { authenticateUser } from "util/authMiddleware";
import sendCustomNewRelicEvent from "util/saveNewRelicEvent";
const crypto = require("crypto");

/* eslint-disable */
export default async (req, res) => {
  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let encryptedMessages = encryptMessages(obj.msg);
  let insertResult = await createMessage(
    db,
    encryptedMessages,
    obj.hasAttachments
  );
  if (!insertResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!insertResult.insertedId) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success", id: insertResult.insertedId });
};

const encryptMessages = (data) => {
  const { message } = data;
  if (!message) return data;

  const algorithm = "aes-256-cbc";
  const encryptionKey = Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY, "hex");
  const key = crypto.scryptSync(encryptionKey, "salt", 32);
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  delete data.message;
  data.encryptedMessage = encrypted;
  return data;
};

const createMessage = async (db, data, hasAttachments) => {
  if (!hasAttachments) {
    delete data.pendingID;
    delete data.status;
  }
  try {
    const msgCreated = await db.collection("messages").insertOne(data);
    recordNewRelicEvents(msgCreated.insertedId, data);
    return msgCreated;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const recordNewRelicEvents = (messageId, data) => {
  const timestamp = new Date().toISOString();
  sendCustomNewRelicEvent({
    data: {
      messageId,
      creatorId: data.creator_id,
      topicId: data.topic_id,
      harthId: data.comm_id,
      createdAt: timestamp,
    },
    title: "MessageCreated",
  });
  sendCustomNewRelicEvent({
    data: {
      harthId: data.comm_id,
      activityType: "message",
      createdAt: timestamp,
    },
    title: "HarthActivity",
  });
};

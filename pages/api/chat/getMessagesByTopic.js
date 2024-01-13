import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import crypto from "crypto";
import { authenticateUser } from "../../../util/authMiddleware";
/* eslint-disable */

const algorithm = "aes-256-cbc";
const encryptionKeyHex = process.env.MESSAGE_ENCRYPTION_KEY;
const encryptionKey = Buffer.from(encryptionKeyHex, "hex");
const key = crypto.scryptSync(encryptionKey, "salt", 32);
const iv = Buffer.alloc(16, 0);

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    await db.command({ ping: 1 });
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

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

async function getMsgs(db, id, page = 1, limit = 25, blockedList) {
  const skip = (page - 1) * limit;
  return await db
    .collection("messages")
    .find({ topic_id: id, creator_id: { $nin: blockedList } })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

function decrypt(data) {
  const { encryptedMessage } = data;
  if (encryptedMessage) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
    decrypted += decipher.final("utf8");
    data.message = decrypted;
  }
  return data;
}

async function decryptMessages(msgs) {
  return Promise.all(msgs.map(decrypt));
}

import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import crypto from "crypto";

export default async (req, res) => {
  let errorMsg = "";

  const obj = req.body === "string" ? JSON.parse(req.body) : req.body;

  const { comm_id } = obj;

  const algorithm = "aes-256-cbc";
  const encryptionKey = Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY, "hex");
  const key = crypto.scryptSync(encryptionKey, "salt", 32);
  const iv = Buffer.alloc(16, 0);

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

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  // Authentication
  const { userId } =
    jwt.verify(req.headers["x-auth-token"], process.env.SECRET) || {};

  const user =
    userId &&
    (await db.collection("users").findOne({ _id: new ObjectId(userId) }));

  if (
    !req.headers["x-auth-token"] ||
    !user ||
    user.token !== req.headers["x-auth-token"] ||
    new Date() > new Date(user.token_expiration)
  ) {
    errorMsg = "Invalid Token or No User Found or Expired Token.";
    return res.status(401).json({ msg: errorMsg, ok: 0 });
  }
  // Authentication end
  const query = {
    comm_id: comm_id,
    flagged: true,
    approvedByAdmin: false,
    approvedByAdminKeepBlurred: false,
  };

  const searchMessages = () => {
    return db.collection("messages").find(query).toArray();
  };

  const searchConversationMessages = () => {
    return db.collection("conversation_messages").find(query).toArray();
  };

  const [messagesResults, conversationMessagesResults] = await Promise.all([
    searchMessages(),
    searchConversationMessages(),
  ]);

  const messages = [
    ...(messagesResults || []),
    ...(conversationMessagesResults || []),
  ];
  let decryptedMessages = await decryptMessages(messages);

  if (messages.length) {
    return res.json({
      msg: "Matches found",
      messages: decryptedMessages,
      ok: 1,
    });
  } else {
    return res.json({
      msg: "No matches found",
      ok: 0,
    });
  }
};

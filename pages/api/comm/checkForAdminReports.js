import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  let errorMsg = "";

  const obj = req.body === "string" ? JSON.parse(req.body) : req.body;

  const { comm_id } = obj;
  console.log(obj, "obj");

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
    return db.collection("messages").findOne(query);
  };
  const searchConversationMessages = () => {
    return db.collection("conversation_messages").findOne(query);
  };
  const [messageResult, conversationResult] = await Promise.all([
    searchMessages(),
    searchConversationMessages(),
  ]);

  if (messageResult || conversationResult) {
    return res.json({
      msg: "Matchmessages",
      ok: 1,
    });
  } else {
    return res.json({
      msg: "No matches found",
      ok: 0,
    });
  }
};

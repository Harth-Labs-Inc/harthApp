import clientPromise from "../../../util/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  let errorMsg = "";

  const { message } =
    typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  if (!message) {
    errorMsg = "Message not provided.";
    return res.json({ msg: errorMsg, ok: 0 });
  }

  const { topic_id, comm_id, creator_id } = message;

  const client = await clientPromise;
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
    return res.json({ msg: errorMsg, ok: 0 });
  }

  const topic = await db
    .collection("topics")
    .findOne({ _id: new ObjectId(topic_id) });
  const topicMemberIds = topic.members
    .filter((member) => !member.muted)
    .map((member) => member.user_id);

  const community = await db
    .collection("communities")
    .findOne({ _id: new ObjectId(comm_id) });
  const userIDsToNotify = community.users
    .filter(
      (user) =>
        topicMemberIds.includes(user.userId) &&
        !user.muted &&
        user.userId !== creator_id
    )
    .map((user) => user.userId);

  return res.json({
    msg: errorMsg || "successful",
    ok: errorMsg ? 0 : 1,
    userIDsToNotify,
  });
};

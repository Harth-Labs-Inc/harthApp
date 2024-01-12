import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import { ObjectId } from "mongodb";
import { authenticateUser } from "util/authMiddleware";

export default async (req, res) => {
  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let errorMsg = "";

  const { message } =
    typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  if (!message) {
    errorMsg = "Message not provided.";
    return res.json({ msg: errorMsg, ok: 0 });
  }

  const { topic_id, comm_id, creator_id } = message;

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
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
  const communityUserIds = community.users
    .filter(
      (user) =>
        topicMemberIds.includes(user.userId) &&
        !user.muted &&
        user.userId !== creator_id
    )
    .map((user) => user.userId);

  const users = await db
    .collection("users")
    .find({
      _id: { $in: communityUserIds.map((id) => new ObjectId(id)) },
      $and: [
        { "BlockedList.userId": { $ne: creator_id } },
        { _id: { $ne: new ObjectId(user._id) } },
      ],
    })
    .toArray();

  const userIDsToNotify = users.map((userDoc) => userDoc._id.toString());

  return res.json({
    msg: errorMsg || "successful",
    ok: errorMsg ? 0 : 1,
    userIDsToNotify,
  });
};

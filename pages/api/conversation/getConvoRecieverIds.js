import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

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

  const { userIDS, creator_id, conversation_id, comm_id } = message;

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
    return res.json({ msg: errorMsg, ok: 0 });
  }
  // Authentication

  const userDocuments = await db
    .collection("users")
    .find({
      _id: { $in: userIDS.map((id) => new ObjectId(id)) },
    })
    .toArray();

  const usersBlockedByCreator = userDocuments
    .filter((userDoc) => {
      const blockedList = userDoc.BlockedList || [];
      const blockedUserIds = blockedList.map((blockedUser) =>
        blockedUser.userId.toString()
      );
      return blockedUserIds.includes(creator_id.toString());
    })
    .map((userDoc) => userDoc._id.toString());

  let userIDsToNotify = userIDS.filter(
    (id) => !usersBlockedByCreator.includes(id) && id !== user._id.toString()
  );

  if (userIDsToNotify.length) {
    const [conv, community] = await Promise.all([
      db
        .collection("conversations")
        .findOne({ _id: new ObjectId(conversation_id) }),
      db.collection("communities").findOne({ _id: new ObjectId(comm_id) }),
    ]);

    const activeConvUserIds = new Set(
      conv.users
        .filter((user) => !user.muted)
        .map((user) => user.userId.toString())
    );

    const activeCommUserIds = new Set(
      community.users
        .filter((user) => !user.muted)
        .map((user) => user.userId.toString())
    );

    userIDsToNotify = userIDsToNotify.filter(
      (id) => activeConvUserIds.has(id) && activeCommUserIds.has(id)
    );
  }

  return res.json({
    msg: errorMsg || "successful",
    ok: errorMsg ? 0 : 1,
    userIDsToNotify: userIDsToNotify,
  });
};

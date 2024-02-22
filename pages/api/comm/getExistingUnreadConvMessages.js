import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { ObjectId } from "mongodb";
import { authenticateUser } from "util/authMiddleware";
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
  const blockedList = user?.BlockedList?.map((blocked) => blocked.userId) || [];

  let fetchResults = await getData(db, obj.id, blockedList);
  if (!fetchResults) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }

  const uniqueConvIds = [
    ...new Set(fetchResults.map((result) => result.conversation_id)),
  ];

  const convs = await getConvsByIds(db, uniqueConvIds);
  const convMutedStatus = {};
  let userid = user._id.toString();
  convs.forEach((conv) => {
    convMutedStatus[conv._id.toString()] = isConvMutedForUser(conv, userid);
  });

  let filteredResults = fetchResults.filter(
    (result) => !convMutedStatus[result.conversation_id]
  );

  return res.json({ msg: "successful", ok: 1, data: filteredResults });
};
const getData = async (db, id, blockedList) => {
  try {
    return (
      (await db
        .collection("unread_conv_messages")
        .find({ user_id: id, creator_id: { $nin: blockedList } })
        .toArray()) || []
    );
  } catch (err) {
    return [];
  }
};
const getConvsByIds = async (db, topicIds) => {
  try {
    const objectIdArray = topicIds.map((id) => new ObjectId(id));

    return await db
      .collection("conversations")
      .find({ _id: { $in: objectIdArray } })
      .toArray();
  } catch (err) {
    return [];
  }
};
const isConvMutedForUser = (conv, userId) => {
  const userInConv = conv.users?.find((user) => user.userId === userId);
  return userInConv && userInConv.muted;
};

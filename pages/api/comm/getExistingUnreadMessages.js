import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { ObjectId } from "mongodb";
import { authenticateUser } from "util/authMiddleware";

/* eslint-disable */
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
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  const blockedList = user?.BlockedList?.map((blocked) => blocked.userId) || [];

  let fetchResults = await getData(db, obj.id, blockedList);
  if (!fetchResults) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }

  const uniqueTopicIds = [
    ...new Set(fetchResults.map((result) => result.topic_id)),
  ];

  const topics = await getTopicsByIds(db, uniqueTopicIds);

  const topicMutedStatus = {};
  topics.forEach((topic) => {
    topicMutedStatus[topic._id.toString()] = isTopicMutedForUser(
      topic,
      decodedToken.userId
    );
  });

  let filteredResults = fetchResults.filter(
    (result) => !topicMutedStatus[result.topic_id]
  );

  return res.json({
    msg: "successful",
    ok: 1,
    data: filteredResults,
    unfilteredData: fetchResults,
  });
};

const getData = async (db, id, blockedList) => {
  try {
    return (
      (await db
        .collection("unread_messages")
        .find({ user_id: id, creator_id: { $nin: blockedList } })
        .toArray()) || []
    );
  } catch (err) {
    return [];
  }
};
const getTopicsByIds = async (db, topicIds) => {
  try {
    const objectIdArray = topicIds.map((id) => new ObjectId(id));

    return await db
      .collection("topics")
      .find({ _id: { $in: objectIdArray } })
      .toArray();
  } catch (err) {
    return [];
  }
};
const isTopicMutedForUser = (topic, userId) => {
  const userInTopic = topic.members?.find((user) => user.user_id === userId);
  return userInTopic && userInTopic.muted;
};

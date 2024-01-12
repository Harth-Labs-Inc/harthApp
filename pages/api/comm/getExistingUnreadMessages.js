import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
/* eslint-disable */

export default async (req, res) => {
  const obj = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

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

  const client = await getClientWithCheck(clientPromise);

  const db = client.db("blarg");

  // authentication ---------------------------------
  const findUser = async (db, id) => {
    const o_id = new ObjectId(id);
    return db.collection("users").findOne({ _id: o_id });
  };

  const decode = async (token) => jwt.verify(token, process.env.SECRET);

  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let decodedToken;
  try {
    decodedToken = await decode(authToken);
  } catch (error) {
    return res.json({ msg: "bad token", ok: 0, lockDown: true });
  }

  const { userId } = decodedToken;
  const user = await findUser(db, userId);
  if (
    !userId ||
    !user ||
    !user.token ||
    user.token !== authToken ||
    new Date() > new Date(user.token_expiration)
  ) {
    return res.status(401).json({
      msg: "Invalid Token or No User Found or Expired Token",
      ok: 0,
      lockDown: true,
    });
  }

  // passed authentication ------------------------------------------
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

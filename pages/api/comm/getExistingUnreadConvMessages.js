import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
/* eslint-disable */

export default async (req, res) => {
  const obj = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const getData = async (db, id) => {
    try {
      return (
        (await db
          .collection("unread_conv_messages")
          .find({ user_id: id })
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
    return res.json({
      msg: "Invalid Token or No User Found or Expired Token",
      ok: 0,
      lockDown: true,
    });
  }

  // passed authentication ------------------------------------------
  let fetchResults = await getData(db, obj.id);
  if (!fetchResults) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }

  const uniqueConvIds = [
    ...new Set(fetchResults.map((result) => result.conversation_id)),
  ];

  const convs = await getConvsByIds(db, uniqueConvIds);
  const convMutedStatus = {};
  convs.forEach((conv) => {
    convMutedStatus[conv._id.toString()] = isConvMutedForUser(
      conv,
      decodedToken.userId
    );
  });

  const filteredResults = fetchResults.filter(
    (result) => !convMutedStatus[result.conversation_id]
  );

  return res.json({ msg: "successful", ok: 1, data: filteredResults });
};

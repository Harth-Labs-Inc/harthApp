import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const obj = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { msg } = obj;

  const createMessages = (db, data) =>
    db.collection("unread_messages").insertMany(data);

  const findHarth = async (db, id) => {
    const o_id = new ObjectId(id);
    return db.collection("communities").findOne({ _id: o_id });
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
  const harth = await findHarth(db, msg?.comm_id);
  if (!msg || !msg.comm_id || !harth || !harth.users || !harth.users.length) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  const messagesData = harth.users
    .filter((usr) => usr && usr.userId !== user._id.toString() && !usr.muted)
    .map((usr) => ({
      topic_id: msg.topic_id,
      creator_id: msg.creator_id,
      user_id: usr.userId,
      creator_name: msg.creator_name,
      creator_image: msg.creator_image,
      comm_id: msg.comm_id,
      date: msg.date,
      message_id: msg._id,
    }));

  if (!messagesData.length) {
    return res.json({ ok: 0, msg: "" });
  }

  await createMessages(db, messagesData);
  return res.json({ ok: 1 });
};

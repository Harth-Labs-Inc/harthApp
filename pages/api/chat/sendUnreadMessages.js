import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import { ObjectId } from "mongodb";
import { authenticateUser } from "util/authMiddleware";

export default async (req, res) => {
  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

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
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

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

import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { token, selectedHarthID, selectedPage, deviceKey } = obj;

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  if (!token) {
    await db.command({ ping: 1 });

    return res.json({
      msg: "function and DB warmed up.",
      ok: 0,
    });
  }

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken) return res.json({ msg: "Invalid Token", ok: 0 });

  const { userId } = decodedToken;
  if (!userId) return res.json({ msg: "Invalid Token", ok: 0 });

  const [user, subscriptions] = await Promise.all([
    db.collection("users").findOne({ _id: new ObjectId(userId) }),
    db.collection("subscriptions").findOne({ userId: userId, deviceKey }),
  ]);

  if (!user) return res.json({ msg: "No User Found", ok: 0 });
  if (user.token !== token) return res.json({ msg: "bad token", ok: 0 });
  if (new Date() > new Date(user.token_expiration))
    return res.json({ msg: "expired token", ok: 0 });

  user._id = user._id.toString();

  const comms = await db
    .collection("communities")
    .find({ _id: { $in: user.comms.map((id) => new ObjectId(id)) } })
    .project({ invites: 0 })
    .toArray();

  let selectedComm =
    comms.length > 0
      ? selectedHarthID && selectedHarthID !== "undefined"
        ? comms.find(
            (com) => com._id.toString() === selectedHarthID.toString()
          ) || comms[0]
        : comms[0]
      : null;

  let creator = selectedComm
    ? selectedComm.users?.find((usr) => usr.userId === user._id.toString())
    : null;

  let topics = [],
    filteredTopics = [],
    conversations = [];
  if (selectedComm) {
    const selectedID = selectedComm._id.toString();
    if (selectedPage == "chat" || !selectedPage) {
      topics = await db
        .collection("topics")
        .find({
          comm_id: selectedID,
          members: { $elemMatch: { user_id: user._id } },
        })
        .sort({ title: 1 })
        .toArray();

      filteredTopics = topics.sort((a, b) => {
        const removeEmoji = (str) => {
          return str
            .replace(
              /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
              ""
            )
            .replace(/\s+/g, " ")
            .trim();
        };
        const nameA = removeEmoji(a.title);
        const nameB = removeEmoji(b.title);

        if (nameA.toLowerCase() < nameB.toLowerCase()) {
          return -1;
        }
        if (nameA.toLowerCase() > nameB.toLowerCase()) {
          return 1;
        }

        return 0;
      });
    }
    if (selectedPage == "message") {
      conversations = await db
        .collection("conversations")
        .find({
          harthId: selectedID,
          users: { $elemMatch: { userId: user._id } },
        })
        .toArray();
    }
  }

  return res.json({
    msg: "user found",
    user,
    ok: 1,
    comms,
    selectedComm,
    creator,
    topics: filteredTopics,
    conversations,
    subscriptions,
  });
};

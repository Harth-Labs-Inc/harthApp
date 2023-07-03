import clientPromise from "../../../util/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { token, selectedHarthID } = obj;

  if (!token) {
    return res.json({
      msg: "No token provided, function is warmed up.",
      ok: 0,
    });
  }

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken) return res.json({ msg: "Invalid Token", ok: 0 });

  const { userId } = decodedToken;
  if (!userId) return res.json({ msg: "Invalid Token", ok: 0 });

  const client = await clientPromise;
  const db = client.db("blarg");

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

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
    filteredTopics = [];
  if (selectedComm) {
    const selectedID = selectedComm._id.toString();
    topics = await db
      .collection("topics")
      .find({
        comm_id: selectedID,
        members: { $elemMatch: { user_id: user._id } },
      })
      .sort({ title: 1 })
      .toArray();

    const removeEmoji = (str) =>
      str
        .replace(
          /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
          ""
        )
        .replace(/\s+/g, " ")
        .trim();

    filteredTopics = topics.sort((a, b) => {
      const nameA = removeEmoji(a.title);
      const nameB = removeEmoji(b.title);
      return nameA.localeCompare(nameB);
    });
  }

  return res.json({
    msg: "user found",
    user,
    ok: 1,
    comms,
    selectedComm,
    creator,
    topics: filteredTopics,
  });
};

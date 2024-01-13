import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { authenticateUser } from "../../../util/authMiddleware";
import { ObjectId } from "mongodb";
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
  const userId = user._id.toString();

  try {
    const community = await db.collection("communities").findOne({
      _id: new ObjectId(obj.harthId),
      $or: [{ "users.userId": userId }, { "users.user_id": userId }],
    });

    if (!community) {
      return res.json({ msg: "No matching community found", ok: 0 });
    }

    const matchingUser = community.users.find(
      (u) => u.userId === userId || u.user_id === userId
    );

    return res.json({
      msg: "successful",
      ok: 1,
      user: matchingUser,
      harthId: obj.harthId,
    });
  } catch (error) {
    console.error("Error fetching community:", error);
    return res.json({ msg: "Internal server error", ok: 0 });
  }
};

import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import { ObjectId } from "mongodb";
import { authenticateUser } from "util/authMiddleware";

export default async (req, res) => {
  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let errorMsg = "";

  const obj = req.body === "string" ? JSON.parse(req.body) : req.body;

  const { msg, postCollection } = obj;

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  if (!msg._id) {
    errorMsg = "msg_id is required.";
    return res.json({ msg: errorMsg, ok: 0 });
  }

  if (!postCollection) {
    errorMsg = "postCollection is required.";
    return res.json({ msg: errorMsg, ok: 0 });
  }

  try {
    await db.collection(postCollection).updateOne(
      { _id: new ObjectId(msg._id) },
      {
        $unset: {
          flagged: "",
          approvedByAdmin: "",
          approvedByAdminKeepBlurred: "",
        },
      }
    );
  } catch (error) {
    console.error("Error updating document:", error);
    return res.json({ msg: "Internal Server Error", ok: 0 });
  }

  return res.json({
    msg: errorMsg || "successful",
    ok: errorMsg ? 0 : 1,
  });
};

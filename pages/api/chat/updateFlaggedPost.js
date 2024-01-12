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
  const { _id, flagged, approvedByAdmin, approvedByAdminKeepBlurred } = msg;

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  if (!_id) {
    errorMsg = "msg_id is required.";
    return res.json({ msg: errorMsg, ok: 0 });
  }
  if (!postCollection) {
    errorMsg = "postCollection is required.";
    return res.json({ msg: errorMsg, ok: 0 });
  }

  try {
    const updateFields = {};
    if (flagged !== undefined) updateFields.flagged = flagged;
    if (approvedByAdmin !== undefined)
      updateFields.approvedByAdmin = approvedByAdmin;
    if (approvedByAdminKeepBlurred !== undefined)
      updateFields.approvedByAdminKeepBlurred = approvedByAdminKeepBlurred;

    if (Object.keys(updateFields).length > 0) {
      await db
        .collection(postCollection)
        .updateOne({ _id: new ObjectId(_id) }, { $set: updateFields });
    } else {
      errorMsg = "No fields to update.";
      return res.json({ msg: errorMsg, ok: 0 });
    }
  } catch (error) {
    console.error("Error updating document:", error);
    return res.json({ msg: "Internal Server Error", ok: 0 });
  }

  return res.json({
    msg: errorMsg || "Update successful",
    ok: errorMsg ? 0 : 1,
  });
};

import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  let errorMsg = "";

  const obj = req.body === "string" ? JSON.parse(req.body) : req.body;

  const { msg, postCollection } = obj;
  const { _id, flagged, approvedByAdmin, approvedByAdminKeepBlurred } = msg;

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  // Authentication
  const { userId } =
    jwt.verify(req.headers["x-auth-token"], process.env.SECRET) || {};

  const user =
    userId &&
    (await db.collection("users").findOne({ _id: new ObjectId(userId) }));

  if (
    !req.headers["x-auth-token"] ||
    !user ||
    user.token !== req.headers["x-auth-token"] ||
    new Date() > new Date(user.token_expiration)
  ) {
    errorMsg = "Invalid Token or No User Found or Expired Token.";
    return res.json({ msg: errorMsg, ok: 0 });
  }
  // Authentication end
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

import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  let errorMsg = "";

  const obj = req.body === "string" ? JSON.parse(req.body) : req.body;

  const { msg, postCollection } = obj;

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

import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const updateUser = (db, userId, update) => {
  return new Promise((resolve, reject) => {
    const o_id = new ObjectId(userId);

    const query = { _id: o_id };
    const updateOperation = { $set: update };

    db.collection("users").updateOne(
      query,
      updateOperation,
      { upsert: true },
      function (err) {
        if (err) {
          reject(err);
        }
        db.collection("users").findOne({ _id: o_id }, function (err, user) {
          if (err) {
            reject(err);
          } else {
            resolve(user);
          }
        });
      }
    );
  });
};

export default async (req, res) => {
  let errorMsg = "";

  const obj = req.body === "string" ? JSON.parse(req.body) : req.body;

  const { userIdForUpdate, update } = obj;

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
  try {
    const updatedUser = await updateUser(db, userIdForUpdate, update);

    return res.json({
      msg: "successful",
      ok: 1,
      updatedUser,
    });
  } catch (error) {
    errorMsg = "Error updating user.";
    return res.json({ msg: errorMsg, ok: 0 });
  }
};

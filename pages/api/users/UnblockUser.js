import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const unblockUserId = (db, data, id) => {
  return new Promise((resolve) => {
    const o_id = new ObjectId(data._id);
    delete data._id;

    const query = { _id: o_id };
    const updateOperation = {
      $pull: { BlockedList: { userId: id } },
    };

    db.collection("users").updateOne(
      query,
      updateOperation,
      { upsert: true },
      function (err) {
        if (err) {
          resolve(false);
        }
        db.collection("users").findOne({ _id: o_id }, function (err, user) {
          if (err) {
            resolve(false);
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

  const { ActiveUser, userIdToUnblock } = obj;

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
  let newUser = await unblockUserId(db, ActiveUser, userIdToUnblock);

  return res.json({
    msg: errorMsg || "successful",
    ok: errorMsg ? 0 : 1,
    newUser,
  });
};

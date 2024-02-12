import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { authenticateUser } from "util/authMiddleware";
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

  let fetchResults = await getHarth(db, obj.id);
  if (!fetchResults) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }
  return res.json({ msg: "successful", ok: 1, data: fetchResults });
};
async function getHarth(db, id) {
  let mongo = require("mongodb");
  let o_id = new mongo.ObjectId(id);
  try {
    const results = await db
      .collection("communities")
      .find({ _id: o_id })
      .toArray();
    return results[0] || false;
  } catch (err) {
    return false;
  }
}

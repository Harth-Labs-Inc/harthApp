import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { authenticateUser } from "util/authMiddleware";

/* eslint-disable */
const createComm = (db, data) => {
  return new Promise((resolve, reject) => {
    db.collection("communities").insertOne(
      { ...data, createdAt: new Date() },
      function (err, commCreated) {
        if (err) {
        }
        resolve(commCreated);
      }
    );
  });
};

export default async (req, res) => {
  let authToken = req.headers["x-auth-token"];
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

  let getCommResult = await createComm(db, obj.comm);
  if (!getCommResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getCommResult.insertedId) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success", id: getCommResult.insertedId });
};

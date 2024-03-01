import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { ObjectId } from "mongodb";
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

  const { type, topic } = obj.data;

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  switch (type) {
    case "replace":
      await replaceTopic(db, topic?._id, topic);
      break;
    default:
      break;
  }
  return res.json({ msg: "update successful", ok: 1 });
};

const replaceTopic = (db, id, topic) => {
  return new Promise((resolve) => {
    let o_id = new ObjectId(id);
    delete topic._id;
    let newValues = {
      $set: {
        ...topic,
      },
    };
    db.collection("topics").updateOne(
      { _id: o_id },
      newValues,
      function (err, _) {
        if (err) {
          console.error(err);
          resolve(false);
        }
        resolve(true);
      }
    );
  });
};

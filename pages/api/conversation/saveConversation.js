import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { authenticateUser } from "util/authMiddleware";
import sendCustomNewRelicEvent from "util/saveNewRelicEvent";

/* eslint-disable */
const createConv = (db, data) => {
  return new Promise((resolve, reject) => {
    db.collection("conversations").insertOne(data, function (err, convCreated) {
      if (err) {
      }
      if (process.env.NODE_ENV === "production") {
        const timestamp = new Date();
        sendCustomNewRelicEvent({
          data: {
            harthId: data.harthId,
            createdAt: timestamp.toISOString(),
          },
          title: "ConversationCreated",
        });
      }
      resolve(convCreated);
    });
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

  let getConvResult = await createConv(db, obj.conversation);

  if (!getConvResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!getConvResult.insertedId) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success", id: getConvResult.insertedId });
};

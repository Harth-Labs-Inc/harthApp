import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { authenticateUser } from "util/authMiddleware";
/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { commId, UserId } = obj;

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  let authToken = req.headers["x-auth-token"];
  if (!authToken) {
    await db.command({ ping: 1 });
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let topics = await getTopics(db, commId, UserId);

  return res.json({ msg: "topics found", ok: 1, topics: topics });
};

const getTopics = (db, id, usrId) => {
  return new Promise((resolve, reject) => {
    db.collection("topics")
      .find({
        comm_id: id,
        members: { $elemMatch: { user_id: usrId } },
      })
      .toArray(function (err, results) {
        if (err) {
          resolve(false);
        }

        let filteredTopics = results.sort((a, b) => {
          const removeEmoji = (str) => {
            return str
              .replace(
                /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                ""
              )
              .replace(/\s+/g, " ")
              .trim();
          };
          const nameA = removeEmoji(a.title);
          const nameB = removeEmoji(b.title);

          if (nameA.toLowerCase() < nameB.toLowerCase()) {
            return -1;
          }
          if (nameA.toLowerCase() > nameB.toLowerCase()) {
            return 1;
          }

          return 0;
        });
        resolve(filteredTopics);
      });
  });
};

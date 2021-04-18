import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { commId, UserId } = obj;

  const getTopics = (db, id, usrId) => {
    return new Promise((resolve, reject) => {
      console.log(usrId, id);
      db.collection("topics")
        .find({ comm_id: id, members: { $elemMatch: { user_id: usrId } } })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
        });
    });
  };
  console.log(typeof UserId);
  const { db } = await connectToDatabase();
  let topics = await getTopics(db, commId, UserId);

  return res.json({ msg: "topics found", ok: 1, topics: topics });
};

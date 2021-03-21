import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const getTopics = (db, id) => {
    return new Promise((resolve, reject) => {
      db.collection("topics")
        .find({ comm_id: id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
        });
    });
  };

  const { db } = await connectToDatabase();
  let topics = await getTopics(db, obj.id);

  return res.json({ msg: "topics found", ok: 1, topics: topics });
};

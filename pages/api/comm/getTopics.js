import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  console.log(obj);

  const getTopics = (db, ids) => {
    return new Promise((resolve, reject) => {
      console.log(ids);
      let mongo = require("mongodb");
      let oids = [];
      ids.forEach((id) => {
        oids.push(new mongo.ObjectID(id));
      });
      db.collection("topics")
        .find({ _id: { $in: oids } })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
        });
    });
  };

  const { db } = await connectToDatabase();

  let topicsResults = {};
  for (let [com, topics] of Object.entries(obj.topics)) {
    if (!topicsResults[com]) {
      topicsResults[com] = [];
    }
    let topicsArr = await getTopics(db, topics);
    topicsResults[com] = topicsArr;
  }

  return res.json({ msg: "topics found", ok: 1, topics: topicsResults });
};

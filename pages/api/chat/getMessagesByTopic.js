import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const getMsgs = (db, id) => {
    return new Promise((resolve, reject) => {
      db.collection("messages")
        .find({ topic_id: id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
        });
    });
  };

  const { db } = await connectToDatabase();
  let fetchResults = await getMsgs(db, obj.id);
  if (!fetchResults) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }
  return res.json({ msg: "successful", ok: 1, fetchResults });
};

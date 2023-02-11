import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const getData = (db, id) => {
    return new Promise((resolve, reject) => {
      db.collection("unread_chats")
        .find({ user_id: id })
        .toArray(function (err, results) {
          if (err) {
            resolve([]);
          }
          if (results) {
            resolve(results[0]);
          } else {
            resolve([]);
          }
        });
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let fetchResults = await getData(db, obj.id);
  if (!fetchResults) {
    return res.json({ msg: "Something Went Wrong", ok: 0 });
  }
  return res.json({ msg: "successful", ok: 1, data: fetchResults });
};

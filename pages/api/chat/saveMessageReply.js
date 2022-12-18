import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const createMessage = (db, data) => {
    return new Promise((resolve, reject) => {
      db.collection("replies").insertOne(data, function (err, msgCreated) {
        if (err) {
        }
        resolve(msgCreated);
      });
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let insertResult = await createMessage(db, obj.msg);
  if (!insertResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  if (!insertResult.insertedId) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "success", id: insertResult.insertedId });
};

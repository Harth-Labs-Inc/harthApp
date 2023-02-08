import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const replaceTopic = (db, id, data) => {
    return new Promise((resolve, reject) => {
      db.collection("unread_chats").updateOne(
        { user_id: id },
        { $set: { ...data } },
        { upsert: true },
        function (err, res) {
          if (err) {
            resolve("");
          }
          try {
            let { _id } = res.result.upserted[0];
            if (_id) {
              resolve(_id);
            }
          } catch (error) {
            resolve("");
          }

          resolve("");
        }
      );
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");

  let results = await replaceTopic(db, obj.msg.user_id, obj.msg);

  if (!results) {
    return res.json({ ok: 0 });
  }
  return res.json({ msg: "update successful", ok: 1 });
};

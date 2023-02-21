import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;

  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  console.log(obj, "sasssssssssssssssssssss", obj);

  const updateMessage = (db, harthID, userID, name) => {
    return new Promise((resolve, reject) => {
      db.collection("messages").updateMany(
        { comm_id: harthID, creator_id: userID },
        { $set: { creator_name: name } },
        function (err, msgCreated) {
          if (err) {
            resolve(false);
          }
          resolve(msgCreated);
        }
      );
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");
  let updateResult = await updateMessage(db, obj.id, obj.userID, obj.newName);
  if (!updateResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  return res.json({ ok: 1, msg: "success" });
};

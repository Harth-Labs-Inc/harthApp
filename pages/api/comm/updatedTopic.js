import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { type, topic } = obj.data;

  const replaceTopic = (db, id, topic) => {
    console.log(id, topic);
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      delete topic._id;
      let newValues = {
        $set: {
          ...topic,
        },
      };
      db.collection("topics").updateOne(
        { _id: o_id },
        newValues,
        function (err, profCreated) {
          if (err) {
            console.log(err);
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  };
  const client = await clientPromise;
  const db = client.db("blarg");
  switch (type) {
    case "replace":
      await replaceTopic(db, topic?._id, topic);
      break;

    default:
      break;
  }

  return res.json({ msg: "update successful", ok: 1 });
};

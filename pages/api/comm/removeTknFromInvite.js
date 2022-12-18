import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const removeTknFromInvite = (db, commId, tkn) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(commId);
      db.collection("communities").updateOne(
        { _id: o_id },
        { $pull: { invites: tkn } },
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
  let removeInvite = await removeTknFromInvite(db, obj._id, obj.tkn);
  return res.json({ msg: "update successful", ok: 1, comm });
};

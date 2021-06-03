import { connectToDatabase } from "../../../util/mongodb";

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { id } = obj;

  const generateToken = () => {
    return new Promise((resolve, reject) => {
      var randomChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var result = "";
      for (var i = 0; i < 6; i++) {
        result += randomChars.charAt(
          Math.floor(Math.random() * randomChars.length)
        );
      }
      resolve(result);
    });
  };

  const saveInvite = (db, data) => {
    return new Promise((resolve, reject) => {
      db.collection("invites").replaceOne(
        { comm_id: data.comm_id },
        data,
        { upsert: true },
        function (err, inviteCreated) {
          if (err) {
          }
          resolve(inviteCreated);
        }
      );
    });
  };
  const { db } = await connectToDatabase();
  let token = await generateToken();
  let date = new Date();
  let tempExpiration = new Date(date.setDate(date.getDate() + 1));
  let invite = { comm_id: id, token, expiration: tempExpiration };
  let saveResult = await saveInvite(db, invite);
  if (!saveResult) {
    return res.json({ msg: "Something went wrong", ok: 0 });
  }
  return res.json({ msg: "successful", ok: 1, invite });
};

import clientPromise from "../../../util/mongodb";
import jwt from "jsonwebtoken";

/* eslint-disable */

export default async (req, res) => {
  let obj;

  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const deleteTopic = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("topics").remove({ _id: o_id }, function (err, result) {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  };
  const deleteTopicMessages = (db, id = "") => {
    return new Promise((resolve, reject) => {
      db.collection("messages").deleteMany(
        { topic_id: id.toString() },
        function (err, result) {
          if (err) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  };
  const deleteTopicImages = (db, id, harthID) => {
    console.log(id);
    return new Promise(async (resolve, reject) => {
      if (id && harthID) {
        const aws = require("aws-sdk");
        aws.config = {
          accessKeyId: process.env.AWS_ACCESS,
          secretAccessKey: process.env.AWS_SECRET,
          region: "us-east-2",
        };
        const s3 = new aws.S3();
        const params = {
          Bucket: "topic-message-attachments",
          Prefix: `${harthID}-${id}-`,
        };
        let data = await s3.listObjectsV2(params).promise();
        console.log(data.Contents);
        if (data.Contents && data.Contents.length) {
          const filesToDelete = data.Contents.map(({ Key }) => ({ Key }));
          const deleteParams = {
            Bucket: "topic-message-attachments",
            Delete: {
              Objects: filesToDelete,
            },
          };
          s3.deleteObjects(deleteParams, (err, result) => {
            if (err) {
              resolve(false);
            }
            resolve(true);
          });
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  };

  const client = await clientPromise;
  const db = client.db("blarg");

  // authentication ---------------------------------
  const findUser = (db, id) => {
    return new Promise((resolve, reject) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("users")
        .find({ _id: o_id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };
  const decode = (tokn) => {
    return new Promise((resolve, reject) => {
      resolve(jwt.verify(tokn, process.env.SECRET));
    });
  };
  let authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }
  let decodedToken = await decode(authToken);
  if (!decodedToken) {
    return res.json({ msg: "bad token", ok: 0, lockDown: true });
  }
  let { userId } = decodedToken;
  if (!userId) {
    return res.json({ msg: "Invalid Token", ok: 0, lockDown: true });
  }
  let user = await findUser(db, userId);
  if (!user || !user.token || user == "undefined") {
    return res.json({ msg: "No User Found", ok: 0, lockDown: true });
  }
  if (user.token != authToken) {
    return res.json({ msg: "bad token", ok: 0, lockDown: true });
  }
  if (new Date() > new Date(user.token_expiration)) {
    return res.json({ msg: "expired token", ok: 0, lockDown: true });
  }
  // passed authentication ------------------------------------------

  let deleteResult = await deleteTopic(db, obj.id);
  if (!deleteResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  await deleteTopicMessages(db, obj.id);

  await deleteTopicImages(db, obj.id, obj.harthId);
  return res.json({ ok: 1, msg: "success" });
};

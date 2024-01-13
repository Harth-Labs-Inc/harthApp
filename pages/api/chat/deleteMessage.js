import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import { authenticateUser } from "util/authMiddleware";

/* eslint-disable */

export default async (req, res) => {
  let authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let obj;

  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const deleteMessage = (db, id) => {
    return new Promise((resolve) => {
      let mongo = require("mongodb");
      let o_id = new mongo.ObjectID(id);
      db.collection("messages").remove(
        { _id: o_id },
        function (err, msgCreated) {
          if (err) {
            resolve(false);
          }
          resolve(msgCreated);
        }
      );
    });
  };
  const deleteMessageImages = (db, harthId) => {
    return new Promise(async (resolve, reject) => {
      if (harthId) {
        const aws = require("aws-sdk");
        aws.config = {
          accessKeyId: process.env.AWS_ACCESS,
          secretAccessKey: process.env.AWS_SECRET,
          region: "us-east-2",
        };
        const s3 = new aws.S3();
        const params = {
          Bucket: "topic-message-attachments",
          Prefix: `${harthId}`,
        };
        let data = await s3.listObjectsV2(params).promise();

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

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");
  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let deleteResult = await deleteMessage(db, obj.id);
  if (!deleteResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  await deleteMessageImages(db, obj.harthID);

  return res.json({ ok: 1, msg: "success" });
};

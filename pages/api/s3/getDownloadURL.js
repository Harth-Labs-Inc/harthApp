import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import jwt from "jsonwebtoken";
import aws from "aws-sdk";
import { ObjectId } from "mongodb";

aws.config = {
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET,
  region: "us-east-2",
};

const findUser = async (db, id) => {
  let o_id = ObjectId(id);
  const results = await db.collection("users").find({ _id: o_id }).toArray();
  return results[0];
};

/* eslint-disable */

export default async (req, res) => {
  const client = await getClientWithCheck(clientPromise);

  const db = client.db("blarg");

  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const extractFileExtension = (filename) => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop() : null;
  };

  const extension = extractFileExtension(obj.name);
  const s3Params = {
    Bucket: obj.bucket,
    Key: obj.name,
    ResponseContentDisposition: obj.isAttachment
      ? `attachment; filename=Harth.${extension}`
      : `inline`,
    ResponseContentType: obj.fileType || obj.type,
  };

  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  try {
    const { userId } = jwt.verify(authToken, process.env.SECRET);
    const user = await findUser(db, userId);

    if (
      !user ||
      user.token != authToken ||
      new Date() > new Date(user.token_expiration)
    ) {
      throw new Error();
    }
  } catch (err) {
    return res.status(401).json({ msg: "bad token", ok: 0, lockDown: true });
  }

  const s3 = new aws.S3();
  const downloadURL = s3.getSignedUrl("getObject", s3Params);

  if (!downloadURL) {
    return res.json({ ok: 0, msg: "something went wrong" });
  } else {
    return res.json({ ok: 1, msg: "url created", downloadURL });
  }
};

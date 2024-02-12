import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import aws from "aws-sdk";
import { authenticateUser } from "util/authMiddleware";

aws.config = {
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET,
  region: "us-east-2",
};

/* eslint-disable */

export default async (req, res) => {
  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  let s3Params = {
    Bucket: obj.bucket,
    Key: obj.name,
    ContentType: obj.type,
  };

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }
  const s3 = new aws.S3();
  let uploadURL = s3.getSignedUrl("putObject", s3Params);

  if (!uploadURL) {
    return res.json({ ok: 0, msg: "something went wrong" });
  } else {
    return res.json({ ok: 1, msg: "url created", uploadURL });
  }
};

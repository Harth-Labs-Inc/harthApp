import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import Sharp from "sharp";
import { authenticateUser } from "util/authMiddleware";
import aws from "aws-sdk";

aws.config = {
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET,
  region: "us-east-2",
};
const s3 = new aws.S3();
const maxImageWidth = 280;

/* eslint-disable */
const getFileForConversion = (params) => {
  return s3.getObject(params).promise();
};
const compress = (buffer, format = "jpeg", quality = 97) => {
  return new Promise(async (resolve) => {
    try {
      const { width } = await Sharp(buffer).metadata();
      const desiredWidth = width > maxImageWidth ? maxImageWidth : null;

      const compressedBuffer = await Sharp(buffer)
        .rotate()
        .resize(desiredWidth, null)
        .toFormat(format, { quality })
        .toBuffer();

      const { width: finalWidth, height: finalHeight } =
        await Sharp(compressedBuffer).metadata();

      resolve({
        compressedBuffer,
        desiredHeight: finalHeight,
        desiredWidth: finalWidth,
      });
    } catch (error) {
      resolve({ compressedBuffer: false });
    }
  });
};
const pushConvertedFileToS3 = (buffer, key, bucket, type) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: type,
  };

  return s3.putObject(params).promise();
};

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    await db.command({ ping: 1 });
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  const user = await authenticateUser(db, authToken);

  if (!user) {
    return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
  }

  let s3Params = {
    Bucket: obj.bucket,
    Key: obj.name,
  };
  let file = await getFileForConversion(s3Params);

  if (!file || !file.Body) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  let { compressedBuffer, desiredHeight, desiredWidth } = await compress(
    file.Body,
    obj.height,
    obj.width
  );
  if (!compressedBuffer) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  let saveResult = await pushConvertedFileToS3(
    compressedBuffer,
    obj.thumbnail,
    obj.bucket,
    obj.type
  );

  if (!saveResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "sUCCESS", desiredHeight, desiredWidth });
};

import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";

import jwt from "jsonwebtoken";
import Sharp from "sharp";

/* eslint-disable */

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const aws = require("aws-sdk");
  aws.config = {
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: "us-east-2",
  };
  const s3 = new aws.S3();

  let getFileForConversion = (params) => {
    return new Promise((resolve, reject) => {
      s3.getObject(params, function (err, data) {
        if (err) {
          console.error(err);
          resolve(false);
        }
        resolve(data);
      });
    });
  };
  let compress = (buffer, format = "jpeg", quality = 95) => {
    return new Promise(async (resolve) => {
      try {
        const { width } = await Sharp(buffer).metadata();
        let desiredWidth = null;

        if (width > 280) {
          desiredWidth = 280;
        }

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

  let pushConvertedFileToS3 = (buffer, key, bucket, type) => {
    return new Promise((resolve, reject) => {
      s3.putObject(
        {
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: type,
        },
        function (e, r) {
          if (e) {
            console.error(e);
            resolve(false);
          }

          resolve(true);
        }
      );
    });
  };

  const client = await getClientWithCheck(clientPromise);

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
    return res
      .status(401)
      .json({ msg: "No User Found", ok: 0, lockDown: true });
  }
  if (user.token != authToken) {
    return res.status(401).json({ msg: "bad token", ok: 0, lockDown: true });
  }
  if (new Date() > new Date(user.token_expiration)) {
    return res
      .status(401)
      .json({ msg: "expired token", ok: 0, lockDown: true });
  }
  // passed authentication ------------------------------------------

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

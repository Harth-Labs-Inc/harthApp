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
          console.log(err);
          resolve(false);
        }
        resolve(data);
      });
    });
  };
  let compress = (buffer) => {
    return new Promise(async (resolve) => {
      const sharp = require("sharp");
      try {
        const compressedBuffer = await sharp(buffer)
          .resize(200, 100, { fit: "cover" })
          .toBuffer();

        resolve(compressedBuffer);
      } catch (error) {
        resolve(false);
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
            console.log(e);
            resolve(false);
          }

          resolve(true);
        }
      );
    });
  };

  let s3Params = {
    Bucket: obj.bucket,
    Key: obj.name,
  };
  let file = await getFileForConversion(s3Params);

  if (!file || !file.Body) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }

  let compressedBuffer = await compress(file.Body);
  if (!compressedBuffer) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  let saveResult = await pushConvertedFileToS3(
    compressedBuffer,
    obj.name,
    obj.bucket,
    obj.type
  );
  if (!saveResult) {
    return res.json({ ok: 0, msg: "something went wrong" });
  }
  return res.json({ ok: 1, msg: "sUCCESS" });
};

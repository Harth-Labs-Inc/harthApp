export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const aws = require("aws-sdk");

  let s3Params = {
    Bucket: obj.bucket,
    Key: obj.name,
    ContentType: obj.type,
  };
  aws.config = {
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: "us-east-2",
  };

  const s3 = new aws.S3();
  let uploadURL = s3.getSignedUrl("putObject", s3Params);

  if (!uploadURL) {
    return res.json({ ok: 0, msg: "something went wrong" });
  } else {
    return res.json({ ok: 1, msg: "url created", uploadURL });
  }
};

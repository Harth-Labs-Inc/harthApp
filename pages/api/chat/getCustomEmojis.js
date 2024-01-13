import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { authenticateUser } from "../../../util/authMiddleware";
const aws = require("aws-sdk");
aws.config = {
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: "us-east-2",
};
const s3 = new aws.S3();

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

    const client = await getClientWithCheck(clientPromise);
    const db = client.db("blarg");
    const user = await authenticateUser(db, authToken);

    if (!user) {
        return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
    }

    try {
        const bucketName = "custom-emoji";
        const params = {
            Bucket: bucketName,
            Prefix: `${obj.harthId}-`,
        };

        const s3Response = await s3.listObjectsV2(params).promise();

        const signedUrls = s3Response.Contents.map((item) => {
            const url = `https://custom-emoji.s3.us-east-2.amazonaws.com/${item.Key}`;
            return url;
        });

        return res.json({
            msg: "successful",
            ok: 1,
            urls: signedUrls,
        });
    } catch (error) {
        console.error("Error fetching signed URLs from S3:", error);
        return res
            .status(500)
            .json({ msg: "Error fetching signed URLs from S3", ok: 0 });
    }
};

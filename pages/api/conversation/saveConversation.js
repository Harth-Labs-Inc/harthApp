import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const createConv = (db, data) => {
        return new Promise((resolve, reject) => {
            db.collection("conversations").insertOne(
                data,
                function (err, convCreated) {
                    if (err) {
                    }
                    resolve(convCreated);
                }
            );
        });
    };

    const client = await clientPromise;
    const db = client.db("blarg");
    let getConvResult = await createConv(db, obj.conversation);
    console.log("getConvResult", getConvResult);
    if (!getConvResult) {
        return res.json({ ok: 0, msg: "something went wrong" });
    }
    if (!getConvResult.insertedId) {
        return res.json({ ok: 0, msg: "something went wrong" });
    }
    return res.json({ ok: 1, msg: "success", id: getConvResult.insertedId });
};

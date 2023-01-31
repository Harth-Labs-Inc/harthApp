import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }
    console.log(obj);
    const getMsgs = (db, id) => {
        console.log("getting conversation messages for: ", id);
        return new Promise((resolve, reject) => {
            db.collection("conversation_messages")
                .find({ conversation_id: id })
                .toArray(function (err, results) {
                    if (err) {
                        resolve(false);
                    }
                    resolve(results);
                });
        });
    };

    const client = await clientPromise;
    const db = client.db("blarg");
    let fetchResults = await getMsgs(db, obj.id._id);
    if (!fetchResults) {
        return res.json({ msg: "Something Went Wrong", ok: 0 });
    }
    return res.json({ msg: "successful", ok: 1, fetchResults });
};

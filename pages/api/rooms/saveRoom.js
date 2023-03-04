import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const createRoom = (db, data) => {
        return new Promise((resolve, reject) => {
            db.collection("rooms").insertOne(data, function (err, roomCreated) {
                if (err) {
                }
                resolve(roomCreated);
            });
        });
    };

    const client = await clientPromise;
    const db = client.db("blarg");
    let insertResult = await createRoom(db, obj.room);
    if (!insertResult) {
        return res.json({ ok: 0, msg: "something went wrong" });
    }
    if (!insertResult.insertedId) {
        return res.json({ ok: 0, msg: "something went wrong" });
    }
    return res.json({ ok: 1, msg: "success", id: insertResult.insertedId });
};

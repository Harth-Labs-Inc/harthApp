import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const { commId, UserId } = obj;

    const getTopics = (db, id, usrId) => {
        return new Promise((resolve, reject) => {
            db.collection("topics")
                .find({
                    comm_id: id,
                    members: { $elemMatch: { user_id: usrId } },
                })
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
    let topics = await getTopics(db, commId, UserId);

    return res.json({ msg: "topics found", ok: 1, topics: topics });
};

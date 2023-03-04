import clientPromise from "../../../util/mongodb";

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const { commId, UserId } = obj;

    const getConversations = (db, id, usrId) => {
        return new Promise((resolve, reject) => {
            db.collection("conversations")
                .find({
                    harthId: id,
                    users: { $elemMatch: { userId: usrId } },
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
    let conversations = await getConversations(db, commId, UserId);

    return res.json({
        msg: "conversations found",
        ok: 1,
        conversations: conversations,
    });
};

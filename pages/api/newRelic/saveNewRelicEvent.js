import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import { authenticateUser } from "../../../util/authMiddleware";
import sendCustomNewRelicEvent from "util/saveNewRelicEvent";

/* eslint-disable */
export default async (req, res) => {
  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }
  if (process.env.NODE_ENV !== "production") {
    return res.json({
      msg: "successful",
      ok: 1,
    });
  }

  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }
  const { title, data } = obj;

  if (!title || !data) {
    return res.json({ msg: "bad req", ok: 0 });
  }

  try {
    const client = await getClientWithCheck(clientPromise);
    const db = client.db("blarg");

    const user = await authenticateUser(db, authToken);

    if (!user) {
      return res.status(401).json({ msg: "bad auth", ok: 0, lockDown: true });
    }

    sendCustomNewRelicEvent({ data, title });
    console.log("saving event", response);

    return res.json({
      msg: "successful",
      ok: 1,
    });
  } catch (error) {
    console.error(error);
    return res.json({ msg: "error", ok: 0 });
  }
};

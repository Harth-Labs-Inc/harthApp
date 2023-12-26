import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const jwtSecret = process.env.SECRET;

export async function authenticateUser(db, token) {
  if (!token || !db) {
    return false;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (err) {
    return false;
  }

  const userId = decoded?.userId;
  if (!userId) {
    return false;
  }

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });
  if (
    !user ||
    user.token !== token ||
    new Date() > new Date(user.token_expiration)
  ) {
    return false;
  }

  return user;
}

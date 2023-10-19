import clientPromise from "../../../util/mongodb";
import getClientWithCheck from "../../../util/getMongoClientWithCheck";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
/* eslint-disable */

let braintreeGateway;

if (typeof window === "undefined") {
  const braintree = require("braintree");
  braintreeGateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  });
}

export default async (req, res) => {
  const obj = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const { paymentNonce, amount } = obj;

  const client = await getClientWithCheck(clientPromise);
  const db = client.db("blarg");

  // authentication ---------------------------------
  const findUser = async (db, id) => {
    const o_id = new ObjectId(id);
    return db.collection("users").findOne({ _id: o_id });
  };

  const decode = async (token) => jwt.verify(token, process.env.SECRET);

  const authToken = req.headers["x-auth-token"];
  if (!authToken) {
    return res.json({ msg: "No token Found", ok: 0, lockDown: true });
  }

  let decodedToken;
  try {
    decodedToken = await decode(authToken);
  } catch (error) {
    return res.json({ msg: "bad token", ok: 0, lockDown: true });
  }

  const { userId } = decodedToken;
  const user = await findUser(db, userId);
  if (
    !userId ||
    !user ||
    !user.token ||
    user.token !== authToken ||
    new Date() > new Date(user.token_expiration)
  ) {
    return res.json({
      msg: "Invalid Token or No User Found or Expired Token",
      ok: 0,
      lockDown: true,
    });
  }

  // passed authentication ------------------------------------------
  if (!paymentNonce || !amount) {
    return res.json({
      msg: "Missing nonce or amount",
      ok: 0,
    });
  }
  try {
    const saleResult = await braintreeGateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: paymentNonce.nonce,
      options: {
        submitForSettlement: true,
      },
    });

    if (saleResult.success) {
      return res.json({
        msg: "Payment successful",
        ok: 1,
        transactionId: saleResult.transaction.id,
      });
    } else {
      return res.json({
        msg: "Payment failed",
        ok: 0,
        errors: saleResult.errors.deepErrors(),
      });
    }
  } catch (error) {
    return res.json({
      msg: "Error processing payment",
      ok: 0,
      error: error.message,
    });
  }
};

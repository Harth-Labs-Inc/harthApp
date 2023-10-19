import api from "../services/api";

/* eslint-disable */

export const getBraintreeToken = async (message) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/braintree/getToken`,
      {
        message,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
export const submitBraintreePurchase = async (paymentObj) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/braintree/submitBraintreePurchase`,
      paymentObj,
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

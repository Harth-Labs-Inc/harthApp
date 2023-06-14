import api from "../services/api";

/* eslint-disable */

export const saveUserSubscription = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const res = await api.post(
      `/api/subscriptions/saveSubscription`,
      { data },
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

export const sendPushToSubscribers = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const res = await api.post(
      `/api/subscriptions/sendPushToSubscribers`,
      { data },
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

import api from "../services/api";

/* eslint-disable */

export const removeSubscription = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(`/api/subscriptions/removeSubscription`, data, {
      headers: {
        "x-auth-token": token,
      },
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};
export const sendPushNotification = async (data, fetchURL) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(fetchURL, {
      method: "POST",
      body: JSON.stringify({ data, token }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      throw new Error("Request failed with status: " + response.status);
    }
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

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
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

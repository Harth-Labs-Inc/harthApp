import api from "../services/api";

/* eslint-disable */

export const saveNewRelicEvent = async (title, data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/newRelic/saveNewRelicEvent`,
      {
        title,
        data,
      },
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

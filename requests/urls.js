import api from "../services/api";

/* eslint-disable */

export const getURLMetaData = async (url) => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(
      `/api/url/getMetaData`,
      {
        url,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res;
  } catch (error) {
    console.error(error);
  }
};

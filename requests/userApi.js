import axios from "axios";
import api from "../services/api";

export const login = async ({ email, password }) => {
  try {
    const res = await api.post(`next_api_login/next_api_login.js`, {
      email,
      password,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addUser = async (formData) => {
  try {
    const res = await api.post(
      "next_api_adduser/next_api_adduser.js",
      formData
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserFromToken = async (token) => {
  try {
    const res = await api.post("/api/getUserFromToken", { token });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await axios.get(`/api/auth/logout`);
  } catch (error) {
    console.log(error);
  }
};

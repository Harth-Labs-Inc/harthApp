import axios from "axios";
import api from "../services/api";

export const login = async ({ email, password }) => {
  try {
    const res = await api.post(`/api/login`, {
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
    const res = await api.post("/api/adduser", formData);
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

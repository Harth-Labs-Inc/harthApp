import axios from "axios";
import api from "../services/api";

export const checkForExistingComm = async (name) => {
  try {
    const res = await api.post(`/api/comm/checkForExistingComm`, {
      name,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

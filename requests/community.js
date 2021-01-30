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

export const saveCommunity = async (comm) => {
  try {
    const res = await api.post(`/api/comm/saveCommunity`, {
      comm,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addUserToComm = async (id, prof) => {
  try {
    const res = await api.post(`/api/comm/addUserToComm`, {
      id,
      prof,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getComms = async (user) => {
  try {
    const res = await api.post(`/api/comm/getComms`, {
      user,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

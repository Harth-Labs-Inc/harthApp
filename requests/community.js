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

export const getCommFromInvite = async (id) => {
  try {
    const res = await api.post(`/api/comm/getCommFromInvite`, {
      id,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getTopics = async (commId, UserId) => {
  try {
    const res = await api.post(`/api/comm/getTopics`, {
      commId,
      UserId,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getRooms = async (commId, UserId) => {
  try {
    const res = await api.post(`/api/comm/getRooms`, {
      commId,
      UserId,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const saveTopics = async (topic) => {
  try {
    const res = await api.post(`/api/comm/saveTopics`, {
      topic,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addRoomToUsers = async (ids, room) => {
  try {
    const res = await api.post(`/api/comm/addRoomToUsers`, {
      ids,
      room,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const sendInvite = async (email, id, note) => {
  try {
    const res = await api.post(`/api/comm/sendInvite`, {
      email,
      id,
      note,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

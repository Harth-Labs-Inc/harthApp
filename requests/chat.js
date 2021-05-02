import api from "../services/api";

export const saveMessage = async (msg) => {
  try {
    const res = await api.post(`/api/chat/saveMessage`, {
      msg,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteMessage = async (id) => {
  try {
    const res = await api.post(`/api/chat/deleteMessage`, {
      id,
    });
    return res.data;
  } catch (error) {
    return { ok: 0 };
  }
};

export const updateMessage = async (msg) => {
  try {
    const res = await api.post(`/api/chat/updateMessage`, {
      msg,
    });
    return res.data;
  } catch (error) {
    return { ok: 0 };
  }
};

export const getMessagesByTopic = async (id) => {
  try {
    const res = await api.post(`/api/chat/getMessagesByTopic`, {
      id,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addKeyToDB = async (id, name, fileType) => {
  try {
    const res = await api.post(`/api/chat/addKeyToDB`, {
      id,
      name,
      fileType,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

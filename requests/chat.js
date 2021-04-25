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

import api from "../services/api";

export const saveRoom = async (room) => {
  try {
    const res = await api.post(`/api/game/saveRoom`, {
      room,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

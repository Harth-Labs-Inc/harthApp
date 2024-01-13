import api from "../services/api";

/* eslint-disable */

export const connectUserToRoom = async (user, id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/rooms/connectUserToRoom`,
      {
        user,
        id,
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

export const addRoomToUsers = async (ids, room) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/rooms/addRoomToUsers`,
      {
        ids,
        room,
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

export const getRooms = async (commId, UserId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/rooms/getRooms`,
      {
        commId,
        UserId,
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

export const saveRoom = async (room) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/rooms/saveRoom`,
      {
        room,
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

export const getScheduledCallRooms = async (harthId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/rooms/getScheduledCallRooms`,
      {
        harthId,
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

export const deleteScheduledRoom = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/rooms/deleteScheduledRoom`,
      {
        id,
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

export const updateScheduleRoom = async (room) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/rooms/updateScheduleRoom`,
      {
        room,
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

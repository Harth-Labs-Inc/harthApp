import api from "../services/api";

/* eslint-disable */

export const getConvoRecieverIds = async (message) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/getConvoRecieverIds`,
      {
        message,
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

export const removeUnsavedConvMessages = async (convId, userid) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/removeUnsavedConvMessages`,
      {
        convId,
        userid,
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
export const sendUnreadConvMessages = async (msg) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/sendUnreadConvMessages`,
      {
        msg,
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

export const getconversationMessagesByID = async (id, page, limit) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/getconversationMessagesByID`,
      {
        id,
        page,
        limit,
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

export const deleteConversationFinal = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      `/api/conversation/deleteConversationFinal`,
      data,
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

export const deleteConversation = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(`/api/conversation/deleteConversation`, data, {
      headers: {
        "x-auth-token": token,
      },
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const saveConversation = async (conversation) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/saveConversation`,
      {
        conversation,
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
export const updatedConv = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      `/api/conversation/updatedConv`,
      {
        data,
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
export const getConversations = async (commId, UserId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/getConversations`,
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

export const saveConversationMessage = async (msg) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/saveConversationMessage`,
      {
        msg,
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

export const addKeyToConversationDB = async (
  id,
  name,
  fileType,
  desiredHeight,
  desiredWidth
) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/addKeyToDB`,
      {
        id,
        name,
        fileType,
        desiredHeight,
        desiredWidth,
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

export const updateConversationMessage = async (msg) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/updateConversationMessage`,
      {
        msg,
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

export const deleteConversationMessage = async (id, prefix) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/conversation/deleteConversationMessage`,
      {
        id,
        prefix,
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

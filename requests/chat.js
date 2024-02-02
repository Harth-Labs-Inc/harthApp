import api from "../services/api";

/* eslint-disable */

export const getCustomEmojis = async (data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(`/api/chat/getCustomEmojis`, data, {
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

export const updateFlaggedPost = async (data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(`/api/chat/updateFlaggedPost`, data, {
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
export const unflagPost = async (data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(`/api/chat/unflagPost`, data, {
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
export const flagPost = async (data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(`/api/chat/flagPost`, data, {
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
export const getTopicsRecieverIds = async (message) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/getTopicsRecieverIds`,
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

export const removeUnsavedMessages = async (topicid, userid) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/removeUnsavedMessages`,
      {
        topicid,
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

export const sendUnreadMessages = async (msg) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/sendUnreadMessages`,
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
export const saveMessage = async (msg, hasAttachments) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/saveMessage`,
      {
        msg,
        hasAttachments,
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

export const saveMessageReply = async (msg) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/saveMessageReply`,
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

export const deleteMessage = async (id, harthID) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/deleteMessage`,
      {
        id,
        harthID,
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

export const updateMessage = async (msg) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/updateMessage`,
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

export const updateReply = async (msg) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/updateReply`,
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

export const getRepliesByOwner = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/getRepliesByOwner`,
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

export const addReplyID = async (replyId, ownerId, isReply) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/addReplyID`,
      {
        replyId,
        ownerId,
        isReply,
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

export const getMessagesByTopic = async (id, page, limit) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/getMessagesByTopic`,
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

export const addKeyToDB = async (
  id,
  name,
  fileType,
  desiredHeight,
  desiredWidth,
  isLastImage
) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/addKeyToDB`,
      {
        id,
        name,
        fileType,
        desiredHeight,
        desiredWidth,
        isLastImage,
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

export const replaceHarthChatProfileIcons = async (id, newImg, userID) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/replaceHarthChatProfileIcons`,
      {
        id,
        newImg,
        userID,
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

export const replaceHarthChatProfileNames = async (id, newName, userID) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/chat/replaceHarthChatProfileNames`,
      {
        id,
        newName,
        userID,
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

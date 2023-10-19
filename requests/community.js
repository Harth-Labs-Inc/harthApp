import api from "../services/api";

/* eslint-disable */

export const sendInviteEmails = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(
      `/api/comm/sendInviteEmails`,
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
    console.error(error);
  }
};

export const updateHarthData = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(
      `/api/comm/udpateHarth`,
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
    console.error(error);
  }
};

export const checkIfInviteTokenIsGood = async (data) => {
  try {
    const res = await api.post(`/api/comm/checkIfInviteTokenIsGood`, {
      data,
    });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const leaveHarthByID = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(`/api/comm/leaveHarthByID`, data, {
      headers: {
        "x-auth-token": token,
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const deleteHarthByID = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      `/api/comm/deleteHarthByID`,
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
    console.error(error);
  }
};

export const deleteTopicByID = async (id, harthId) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      `/api/comm/deleteTopicByID`,
      {
        id,
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
    console.error(error);
  }
};

export const getHarthByID = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      `/api/comm/getHarthByID`,
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
    console.error(error);
  }
};

export const getTopicByID = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      `/api/comm/getTopicByID`,
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
    console.error(error);
  }
};

export const updatedTopic = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      `/api/comm/updatedTopic`,
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
    console.error(error);
  }
};

export const updateUserInfo = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      `/api/comm/updateUserInfo`,
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
    console.error(error);
  }
};

export const checkForExistingComm = async (name) => {
  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      `/api/comm/checkForExistingComm`,
      {
        name,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const saveCommunity = async (comm) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/saveCommunity`,
      {
        comm,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const addUserToComm = async (id, prof) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/addUserToComm`,
      {
        id,
        prof,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getComms = async (user) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/getComms`,
      {
        user,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getCommFromInvite = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/getCommFromInvite`,
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
    console.error(error);
  }
};

export const getTopics = async (commId, UserId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/getTopics`,
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
    console.error(error);
  }
};

export const saveTopics = async (topic) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/saveTopics`,
      {
        topic,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const generateInvite = async (data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(`/api/comm/generateInvite`, data, {
      headers: {
        "x-auth-token": token,
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getInviteById = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/getInviteById`,
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
    console.error(error);
  }
};

export const getExistingUnreadConvMessages = async (id, topicid) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/getExistingUnreadConvMessages`,
      {
        id,
        topicid,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
export const getExistingUnreadMessages = async (id, topicid) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/getExistingUnreadMessages`,
      {
        id,
        topicid,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const saveUnsavedMessages = async (msg) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/api/comm/saveUnsavedMessages`,
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
    console.error(error);
  }
};

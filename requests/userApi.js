import api from "../services/api";

/* eslint-disable */

export const updateUser = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(`/api/users/updateUser`, data, {
      headers: {
        "x-auth-token": token,
      },
    });
    return res;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const checkForMatchingEmail = async (formData) => {
  try {
    const res = await api.post("/api/users/checkForMatchingEmail", formData);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const UnblockUser = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(`/api/users/UnblockUser`, data, {
      headers: {
        "x-auth-token": token,
      },
    });
    return res;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const blockUser = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(`/api/users/blockUser`, data, {
      headers: {
        "x-auth-token": token,
      },
    });
    return res;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};
export const sendFeedbackEmail = async (
  collectedData,
  userFeedback,
  screenshotBase64,
  imageFormat,
  userName
) => {
  try {
    const res = await api.post(`/api/users/sendFeedbackEmail`, {
      collectedData,
      userFeedback,
      screenshotBase64,
      imageFormat,
      userName,
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const loginAttempt = async (data) => {
  try {
    const res = await api.post(`/api/users/loginAttempt`, data);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const verifyOtp = async (data) => {
  try {
    const res = await api.post(`/api/users/verifyOtp`, data);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const sendOtpEmailToUser = async (data) => {
  try {
    const res = await api.post(`/api/users/sendOtpEmailToUser`, data);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};
export const sendWelcomeEmailToUser = async (data) => {
  try {
    const res = await api.post(`/api/users/sendWelcomeEmailToUser`, data);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const login = async ({ email, password }) => {
  try {
    const res = await api.post(`/api/users/login`, {
      email,
      password,
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const addUser = async (formData) => {
  try {
    const res = await api.post("/api/users/adduser", formData);
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const getUserDataFromToken = async (
  token,
  selectedHarthID,
  selectedPage,
  deviceKey,
  pushData
) => {
  try {
    const res = await api.post("/api/users/getUserDataFromToken", {
      token,
      selectedHarthID,
      selectedPage,
      deviceKey,
      pushData,
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};
export const getUserFromToken = async (token) => {
  try {
    const res = await api.post("/api/users/getUserFromToken", { token });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const logout = async () => {
  try {
    await api.get(`/api/users/logout`);
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const reset = async (email) => {
  try {
    const res = await api.post(`/api/users/resetpwdEmail`, {
      email,
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const updatePassword = async (password, tkn) => {
  try {
    const res = await api.post(`/api/users/updatePassword`, {
      password,
      tkn,
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const verifyResetTkn = async (tkn) => {
  try {
    const res = await api.post(`/api/users/verifyResetTkn`, {
      tkn,
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const saveAcountSettingsUpdates = async (id, field, value) => {
  try {
    const res = await api.post(`/api/users/saveAcountSettingsUpdates`, {
      id,
      field,
      value,
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

export const sendFullRefreshOTPEmail = async (token, email) => {
  try {
    const res = await api.post(`/api/users/sendFullRefreshOTPEmail`, {
      token,
      email,
    });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      window.location.reload();
    }
    return { ok: 0 };
  }
};

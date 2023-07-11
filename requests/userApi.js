import api from "../services/api";

/* eslint-disable */

export const loginAttempt = async (data) => {
  try {
    const res = await api.post(`/api/users/loginAttempt`, data);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const verifyOtp = async (data) => {
  try {
    const res = await api.post(`/api/users/verifyOtp`, data);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const sendOtpEmailToUser = async (data) => {
  try {
    const res = await api.post(`/api/users/sendOtpEmailToUser`, data);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
export const sendWelcomeEmailToUser = async (data) => {
  try {
    const res = await api.post(`/api/users/sendWelcomeEmailToUser`, data);
    return res.data;
  } catch (error) {
    console.error(error);
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
    console.error(error);
  }
};

export const addUser = async (formData) => {
  try {
    const res = await api.post("/api/users/adduser", formData);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getUserDataFromToken = async (
  token,
  selectedHarthID,
  selectedPage
) => {
  try {
    const res = await api.post("/api/users/getUserDataFromToken", {
      token,
      selectedHarthID,
      selectedPage,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const getUserFromToken = async (token) => {
  try {
    const res = await api.post("/api/users/getUserFromToken", { token });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.get(`/api/users/logout`);
  } catch (error) {
    console.error(error);
  }
};

export const reset = async (email) => {
  try {
    const res = await api.post(`/api/users/resetpwdEmail`, {
      email,
    });
    return res.data;
  } catch (error) {
    console.error(error);
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
    console.error(error);
  }
};

export const verifyResetTkn = async (tkn) => {
  try {
    const res = await api.post(`/api/users/verifyResetTkn`, {
      tkn,
    });
    return res.data;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
  }
};

import api from "../services/api";

export const loginAttempt = async (data) => {
    try {
        const res = await api.post(`/api/loginAttempt`, data);
        return res.data;
    } catch (error) {
        console.log(error);
    }
};
// export const loginAttempt = async (data) => {
//     try {
//         const res = await api.post(`/api/users/loginAttempt`, data);
//         return res.data;
//     } catch (error) {
//         console.log(error);
//     }
// };

export const verifyOtp = async (data) => {
    try {
        const res = await api.post(`/api/users/verifyOtp`, data);
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const sendOtpEmailToUser = async (data) => {
    try {
        const res = await api.post(`/api/users/sendOtpEmailToUser`, data);
        return res.data;
    } catch (error) {
        console.log(error);
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
        console.log(error);
    }
};

export const addUser = async (formData) => {
    console.log(formData, "asdf");
    try {
        const res = await api.post("/api/users/adduser", formData);
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getUserFromToken = async (token) => {
    try {
        const res = await api.post("/api/users/getUserFromToken", { token });
        return res.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await api.get(`/api/users/logout`);
    } catch (error) {
        console.log(error);
    }
};

export const reset = async (email) => {
    try {
        const res = await api.post(`/api/users/resetpwdEmail`, {
            email,
        });
        return res.data;
    } catch (error) {
        console.log(error);
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
        console.log(error);
    }
};

export const verifyResetTkn = async (tkn) => {
    try {
        const res = await api.post(`/api/users/verifyResetTkn`, {
            tkn,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

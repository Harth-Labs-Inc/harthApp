import api from "../services/api";

/* eslint-disable */

export const getURLMetaData = async (url) => {
    try {
        const token = localStorage.getItem("token");

        const res = await api.post(
            `/api/url/getMetaData`,
            {
                url,
            },
            {
                headers: {
                    "x-auth-token": token,
                },
            }
        );
        return res;
    } catch (error) {
        console.error(error);
    }
};

import api from "../services/api";

export const getURLMetaData = async (url) => {
    try {
        const res = await api.post(`/api/url/getMetaData`, {
            url,
        });
        return res;
    } catch (error) {
        console.log(error);
    }
};

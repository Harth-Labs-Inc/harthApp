import api from "../services/api";

export const updateHarthData = async (data) => {
    try {
        const res = await api.post(`/api/comm/udpateHarth`, {
            data,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const checkIfInviteTokenIsGood = async (data) => {
    try {
        const res = await api.post(`/api/comm/checkIfInviteTokenIsGood`, {
            data,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const deleteTopicByID = async (id) => {
    try {
        const res = await api.post(`/api/comm/deleteTopicByID`, {
            id,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};
export const getHarthByID = async (id) => {
    try {
        const res = await api.post(`/api/comm/getHarthByID`, {
            id,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};
export const getTopicByID = async (id) => {
    try {
        const res = await api.post(`/api/comm/getTopicByID`, {
            id,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const updatedTopic = async (data) => {
    try {
        const res = await api.post(`/api/comm/updatedTopic`, {
            data,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const updateUserInfo = async (data) => {
    try {
        const res = await api.post(`/api/comm/updateUserInfo`, {
            data,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const checkForExistingComm = async (name) => {
    try {
        const res = await api.post(`/api/comm/checkForExistingComm`, {
            name,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const saveCommunity = async (comm) => {
    try {
        const res = await api.post(`/api/comm/saveCommunity`, {
            comm,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const addUserToComm = async (id, prof) => {
    try {
        const res = await api.post(`/api/comm/addUserToComm`, {
            id,
            prof,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getComms = async (user) => {
    try {
        const res = await api.post(`/api/comm/getComms`, {
            user,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getCommFromInvite = async (id) => {
    try {
        const res = await api.post(`/api/comm/getCommFromInvite`, {
            id,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getTopics = async (commId, UserId) => {
    try {
        const res = await api.post(`/api/comm/getTopics`, {
            commId,
            UserId,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const saveTopics = async (topic) => {
    try {
        const res = await api.post(`/api/comm/saveTopics`, {
            topic,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const generateInvite = async (data) => {
    console.log(data, "data");
    try {
        const res = await api.post(`/api/comm/generateInvite`, data);
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getInviteById = async (id) => {
    try {
        const res = await api.post(`/api/comm/getInviteById`, {
            id,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

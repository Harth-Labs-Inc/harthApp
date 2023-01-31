import api from "../services/api";

export const saveConversation = async (conversation) => {
    try {
        const res = await api.post(`/api/conversation/saveConversation`, {
            conversation,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getConversations = async (commId, UserId) => {
    try {
        const res = await api.post(`/api/conversation/getConversations`, {
            commId,
            UserId,
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const saveConversationMessage = async (msg) => {
    try {
        const res = await api.post(
            `/api/conversation/saveConversationMessage`,
            {
                msg,
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getConversationMessages = async (id) => {
    try {
        const res = await api.post(
            `/api/conversation/getConversationMessages`,
            {
                id,
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

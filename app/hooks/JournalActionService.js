import axios from "../utils/axios";

export const deleteJournal = async (id) => {
    try {
        const response = await axios.delete(`/api/journals/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting journal:", error);
        throw error;
    }
};

export const changeLockStatus = async (id) => {
    try {
        const response = await axios.put(`/api/toggle-lock-status-by-id/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error changing lock status:", error);
        throw error;
    }
};

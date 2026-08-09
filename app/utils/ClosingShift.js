import axios from "./axios";
import { DateTimeNow } from "./format";
import { SendTelegramAlert } from "./SendTelegramAlert";

export const ClosingShift = async ({ cred_id, amount, message, warehouse, warehouseId }) => {
    const { today } = DateTimeNow();

    try {
        const payload = {
            date_issued: today,
            debt_id: 2,
            cred_id,
            is_confirmed: true,
            amount,
            fee_amount: 0,
            trx_type: "Mutasi Kas",
            description: "Setoran kas akhir shift",
        };

        const response = await axios.post("/api/create-mutation", payload);

        const telegramResponse = await SendTelegramAlert({
            title: "CLOSING SHIFT",
            source: warehouse,
            message,
            forwardChatId: 851552604,
        });

        return {
            ...response.data,
            telegramData: telegramResponse?.data ?? telegramResponse,
        };
    } catch (error) {
        console.error("ClosingShift Error:", error);
        throw error;
    }
};

import axios from "./axios";
import { DateTimeNow } from "./format";
import { SendTelegramAlert } from "./SendTelegramAlert";

const HQ_CASH_ACCOUNT_ID = 2;

export const ClosingShift = async ({ cred_id, amount, message, warehouse, warehouseId }) => {
    const { today } = DateTimeNow();
    const numericAmount = Number(amount) || 0;
    const numericCredId = Number(cred_id);

    try {
        let mutationData = null;

        // Hanya buat jurnal mutasi setoran kas jika:
        // 1. Nominal setoran > 0 (kas akhir lebih besar dari modal awal)
        // 2. Akun kas cabang (cred_id) valid dan berbeda dari akun Kas Pusat (debt_id: 2)
        if (numericAmount > 0 && numericCredId && numericCredId !== HQ_CASH_ACCOUNT_ID) {
            const payload = {
                date_issued: today,
                debt_id: HQ_CASH_ACCOUNT_ID,
                cred_id: numericCredId,
                warehouse_id: warehouseId,
                is_confirmed: true,
                amount: numericAmount,
                fee_amount: 0,
                trx_type: "Mutasi Kas",
                description: "Setoran kas akhir shift",
            };

            const response = await axios.post("/api/create-mutation", payload);
            mutationData = response.data;
        }

        const telegramResponse = await SendTelegramAlert({
            title: "CLOSING SHIFT",
            source: warehouse,
            message,
            forwardChatId: 851552604,
        });

        const isTelegramSuccess = telegramResponse?.success !== false;
        const validTelegramData = isTelegramSuccess
            ? (telegramResponse?.data ?? telegramResponse)
            : null;

        return {
            ...(mutationData || {
                success: true,
                mutationSkipped: true,
                message:
                    numericAmount <= 0
                        ? "Mutasi kas dilewati karena kas akhir tidak melebihi modal awal."
                        : "Mutasi kas dilewati untuk akun kas pusat.",
            }),
            telegramSuccess: isTelegramSuccess,
            telegramError: isTelegramSuccess ? null : telegramResponse?.error,
            telegramData: validTelegramData,
        };
    } catch (error) {
        console.error("ClosingShift Error:", error);
        throw error;
    }
};

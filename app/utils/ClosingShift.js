import axios from "./axios";
import { DateTimeNow } from "./format";
import { SendTelegramAlert } from "./SendTelegramAlert";

export const ClosingShift = async ({
  cred_id,
  amount,
  message,
  warehouse,
  warehouseId,
}) => {
  const { today } = DateTimeNow();

  const checkWarehouseStatus = async () => {
    try {
      const response = await axios.get(
        `/api/check-warehouse-status/${warehouseId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  try {
    const warehouseStatus = await checkWarehouseStatus();

    if (warehouseStatus.data?.is_open === false) {
      throw new Error("Gudang sudah ditutup");
    }

    const payload = {
      date_issued: today,
      debt_id: 2,
      cred_id: cred_id,
      is_confirmed: true,
      amount: amount,
      fee_amount: 0,
      trx_type: "Mutasi Kas",
      description: "Setoran kas akhir shift",
    };

    const response = await axios.post("/api/create-mutation", payload);
    const telegramResponse = await SendTelegramAlert({
      title: "CLOSING SHIFT",
      source: warehouse,
      message: message,
      forwardChatId: 851552604,
    });

    return { ...response.data, telegramData: telegramResponse.data };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

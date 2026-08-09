/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { use, useCallback, useEffect, useState } from "react";
import Payslip from "./Payslip";
import MainContent from "@/app/(app)/main";
import axios from "@/app/utils/axios";

const PayrollInvoices = ({ params }) => {
    const { date } = use(params);

    const [payrolls, setPayrolls] = useState([]);
    const fetchPayrolls = useCallback(async () => {
        try {
            const response = await axios.get(`/api/get-payroll-by-date/${date}`);
            setPayrolls(response.data.data);
        } catch (error) {
            console.error(error);
        }
    }, [date]);

    useEffect(() => {
        fetchPayrolls();
    }, [fetchPayrolls]);

    return (
        <MainContent headerTitle="Payroll Invoice">
            <button
                onClick={() => {
                    setTimeout(() => {
                        window.print();
                    }, 100);
                }}
                className="small-button mb-2"
            >
                Cetak Nota
            </button>

            <div id="print-area" className="grid grid-cols-3 gap-2 bg-white w-250 p-2">
                {payrolls.map((payroll) => (
                    <Payslip key={payroll?.id} payroll={payroll} date={date} />
                ))}
            </div>
        </MainContent>
    );
};

export default PayrollInvoices;

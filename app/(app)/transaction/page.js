"use client";
import MainContent from "../main";
import { useState } from "react";
import TransactionContent from "./component/TransactionContent";

export default function Transaction() {
    const [stockItems, setStockItems] = useState([]);
    return (
        <MainContent headerTitle="Transaction">
            <TransactionContent />
        </MainContent>
    );
}

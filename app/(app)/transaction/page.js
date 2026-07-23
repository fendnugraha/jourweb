import MainContent from "../main";
import TransactionContent from "./component/TransactionContent";

export default function Transaction() {
    return (
        <MainContent headerTitle="Transaction">
            <TransactionContent />
        </MainContent>
    );
}

//metadata page

export const metadata = {
    title: "Transaction",
};

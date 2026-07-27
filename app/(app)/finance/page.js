import MainContent from "../main";
import FinanceContent from "./FinanceContent";

const FinancePage = () => {
    return (
        <MainContent headerTitle="Finance">
            <FinanceContent />
        </MainContent>
    );
};

export default FinancePage;

//make metadata
export const metadata = {
    title: "Finance",
    description: "Finance page for the application",
};

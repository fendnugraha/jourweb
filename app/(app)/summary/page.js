import MainContent from "../main";
import SummaryContent from "./SummaryContent";

const SummaryPage = () => {
    return (
        <MainContent headerTitle="Summary">
            <SummaryContent />
        </MainContent>
    );
};

export default SummaryPage;

//make metadata
export const metadata = {
    title: "Summary",
    description: "Summary page for the application",
};

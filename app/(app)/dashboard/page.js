import MainContent from "../main";
import DashboardContent from "./DashboardContent";

const DashboardPage = () => {
    return (
        <MainContent headerTitle="Dashboard">
            <DashboardContent />
        </MainContent>
    );
};

export default DashboardPage;

export const metadata = {
    title: "Dashboard",
};

import MainContent from "../main";
import SettingContent from "./SettingContent";

const SettingPage = () => {
    return (
        <MainContent headerTitle="Settings">
            <SettingContent />
        </MainContent>
    );
};

export default SettingPage;

//make metadata
export const metadata = {
    title: "Settings",
    description: "Settings page for the application",
};

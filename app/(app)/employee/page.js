import MainContent from "../main";
import EmployeeContent from "./EmployeeContent";

const EmployeePage = () => {
    return (
        <MainContent headerTitle="Employee">
            <EmployeeContent />
        </MainContent>
    );
};

export default EmployeePage;

export const metadata = {
    title: "Employee",
};

import MainContent from "../main";
import DeliveryContent from "./DeliveryContent";

export default function DeliveryPage() {
    return (
        <MainContent headerTitle="Delivery">
            <DeliveryContent />
        </MainContent>
    );
}

export const metadata = {
    title: "Delivery Page",
    description: "This is the delivery page.",
};

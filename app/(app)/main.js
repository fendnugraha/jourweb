import TopBar from "./TopBar";

export default function MainContent({ children, headerTitle = "New Page" }) {
    return (
        <>
            <TopBar title={headerTitle} />
            <main className="h-[calc(100vh-64px)] sm:h-[calc(100vh-120px)] overflow-auto p-4 sm:p-6 pb-24 sm:pb-6">{children}</main>
        </>
    );
}

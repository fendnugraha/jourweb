import TopBar from "./TopBar";

export default function MainContent({ children, headerTitle = "New Page" }) {
    return (
        <>
            <TopBar title={headerTitle} />
            <main className="h-[calc(100vh-120px)] overflow-auto p-6">{children}</main>
        </>
    );
}

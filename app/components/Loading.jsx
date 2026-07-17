const Loading = () => {
    return (
        <div className="flex justify-center items-center h-screen w-screen bg-white dark:bg-slate-700/50 backdrop-blur-sm">
            <div
                className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                role="status"
                aria-label="loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

export default Loading;

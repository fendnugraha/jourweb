import { useEffect, useState } from "react";

export const LiveClock = ({ textSize = "text-sm", style = "" }) => {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleTimeString("id-ID", {
                hour12: false, // 24 jam
            });
            setTime(formatted);
        };

        updateTime(); // set awal
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return <span className={`${textSize} ${style}`}>{time}</span>;
};

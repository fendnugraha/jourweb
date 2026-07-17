import { useEffect, useState } from "react";

export default function useLiveClock() {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const dayName = dateTime.toLocaleDateString("id-ID", { weekday: "long" });
    const date = dateTime.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    const time = dateTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return { dayName, date, time, raw: dateTime };
}

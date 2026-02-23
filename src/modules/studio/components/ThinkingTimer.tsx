import { useEffect, useState } from "react";

function ThinkingTimer({ startTime }: { startTime: number }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(elapsed);

        const interval = setInterval(() => {
            setSeconds(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    if (seconds > 10) {
        return (
            <span className="text-xs text-gray-500 dark:text-gray-400">
                Taking longer than expected, please wait...
            </span>
        );
    }

    return (
        <span className="text-xs text-gray-500 dark:text-gray-400">
            Thinking for {seconds} second{seconds !== 1 ? "s" : ""}...
        </span>
    );
}

export default ThinkingTimer;

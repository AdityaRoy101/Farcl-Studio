import { useEffect, useRef, useState } from "react";
import { stripMarkdown } from "../studio.types";

const TypewriterEffect = ({
    content,
    onComplete,
}: {
    content: string;
    onComplete?: () => void;
}) => {
    const [displayedContent, setDisplayedContent] = useState("");
    const cleanContent = stripMarkdown(content);
    const index = useRef(0);

    useEffect(() => {
        index.current = 0;
        setDisplayedContent("");
    }, [cleanContent]);

    useEffect(() => {
        const animInterval = setInterval(() => {
            if (index.current < cleanContent.length) {
                const chunk = cleanContent.slice(index.current, index.current + 2);
                setDisplayedContent((prev) => prev + chunk);
                index.current += 2;
            } else {
                clearInterval(animInterval);
                if (onComplete) onComplete();
            }
        }, 15);

        return () => clearInterval(animInterval);
    }, [cleanContent, onComplete]);

    return <span className="whitespace-pre-wrap leading-relaxed">{displayedContent}</span>;
};

export default TypewriterEffect;

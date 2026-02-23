import React, { useEffect } from "react";

function AutoResizeTextarea({
    value,
    onChange,
    onKeyDown,
    placeholder,
    disabled,
    inputRef,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    disabled: boolean;
    inputRef: React.RefObject<HTMLTextAreaElement>;
}) {
    useEffect(() => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const scrollH = textarea.scrollHeight;
            const maxH = 150;
            const newHeight = Math.min(scrollH, maxH);
            textarea.style.height = `${newHeight}px`;
            textarea.style.overflowY = scrollH > maxH ? "auto" : "hidden";
        }
    }, [value, inputRef]);

    return (
        <textarea
            ref={inputRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="w-full py-2.5 pl-4 pr-2 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm leading-relaxed"
            rows={1}
            style={{ minHeight: "40px", maxHeight: "150px" }}
            disabled={disabled}
            autoFocus
        />
    );
}

export default AutoResizeTextarea;

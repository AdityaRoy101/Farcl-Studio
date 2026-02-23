import { Lock } from "lucide-react";
import React from "react";
import { cx } from "../studio.types";

function ModeTabButton({
    active,
    onClick,
    icon: Icon,
    label,
    disabled = false,
    customIcon,
}: {
    active: boolean;
    onClick: () => void;
    icon?: React.ElementType;
    label: string;
    disabled?: boolean;
    customIcon?: React.ReactNode;
}) {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={cx(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                disabled
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                    : active
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
        >
            {customIcon ? customIcon : Icon && <Icon size={14} />}
            <span>{label}</span>
            {disabled && <Lock size={10} className="ml-0.5 opacity-50" />}
        </button>
    );
}

function ErrorActions({
    onRegenerate,
    onFeedback,
}: {
    onRegenerate: () => void;
    onFeedback: () => void;
}) {
    return (
        <div className="mt-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-2">
                Something went wrong on our side. Please try one of these options:
            </p>
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                    {/* RotateCcw icon inline to avoid another import chain */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                    Regenerate
                </button>
                <button
                    onClick={onFeedback}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    {/* MessageCircle icon inline */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    Feedback
                </button>
            </div>
        </div>
    );
}

export { ModeTabButton, ErrorActions };

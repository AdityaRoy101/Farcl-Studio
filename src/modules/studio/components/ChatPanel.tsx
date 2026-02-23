import React, { useCallback, useEffect, useRef } from "react";
import { Bot, Check, Copy, Send } from "lucide-react";
import { type ChatMessage, cx, stripMarkdown } from "../studio.types";
import { AppAvatar } from "../../../components/ui/AppAvatar";
import TypewriterEffect from "./TypewriterEffect";
import ThinkingTimer from "./ThinkingTimer";
import AutoResizeTextarea from "./AutoResizeTextarea";
import { ErrorActions } from "./ModeTabButton";

// ------- DataSummaryBadge -------

function DataSummaryBadge({ summary }: { summary: ChatMessage["dataSummary"] }) {
    if (!summary) return null;

    const items: string[] = [];
    if (summary.entities && summary.entities > 0) {
        items.push(`${summary.entities} entit${summary.entities === 1 ? "y" : "ies"}`);
    }
    if (summary.restEndpoints && summary.restEndpoints > 0) {
        items.push(`${summary.restEndpoints} REST endpoint${summary.restEndpoints === 1 ? "" : "s"}`);
    }
    if (summary.graphqlQueries && summary.graphqlQueries > 0) {
        items.push(`${summary.graphqlQueries} GraphQL quer${summary.graphqlQueries === 1 ? "y" : "ies"}`);
    }
    if (summary.graphqlMutations && summary.graphqlMutations > 0) {
        items.push(`${summary.graphqlMutations} GraphQL mutation${summary.graphqlMutations === 1 ? "" : "s"}`);
    }

    if (items.length === 0) return null;

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {items.map((item, idx) => (
                <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
                >
                    <Check size={10} />
                    {item} added to Visual Cards
                </span>
            ))}
        </div>
    );
}

// ------- ChatPanel -------

export interface ChatPanelProps {
    messages: ChatMessage[];
    input: string;
    messageLoading: boolean;
    isTransitioningPhase: boolean;
    thinkingStartTime: number | null;
    apiError: string | null;
    copiedId: string | null;
    authUser: { profileImage?: string | null; name?: string } | null;
    showCenteredHero: boolean;
    heroPlaceholder: string;
    showModeTabs: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSend: () => void;
    onCopy: (m: ChatMessage) => void;
    onMarkAnimated: (id: string) => void;
    onRegenerate: () => void;
    onFeedback: () => void;
    displayName: string;
    endRef: React.RefObject<HTMLDivElement>;
}

function ChatPanel({
    messages,
    input,
    messageLoading,
    isTransitioningPhase,
    thinkingStartTime,
    apiError,
    copiedId,
    authUser,
    showCenteredHero,
    heroPlaceholder,
    showModeTabs,
    onInputChange,
    onSend,
    onCopy,
    onMarkAnimated,
    onRegenerate,
    onFeedback,
    displayName,
    endRef,
}: ChatPanelProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const focusInput = useCallback(() => {
        window.setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, []);

    const prevLoadingRef = useRef<boolean>(false);

    useEffect(() => {
        const wasLoading = prevLoadingRef.current;
        prevLoadingRef.current = messageLoading;

        if (wasLoading && !messageLoading && !isTransitioningPhase) {
            focusInput();
        }
    }, [focusInput, isTransitioningPhase, messageLoading]);

    const handleSend = useCallback(() => {
        onSend();
        focusInput();
    }, [focusInput, onSend]);

    const handleRegenerateClick = useCallback(() => {
        onRegenerate();
        focusInput();
    }, [focusInput, onRegenerate]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isDisabled = messageLoading || isTransitioningPhase;

    if (showCenteredHero) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="max-w-xl text-center">
                    <div className="w-24 h-24 mx-auto mb-1">
                        <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Hello {displayName}, what do you want to build?
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Describe your idea and I'll help you plan it out.
                    </p>
                </div>

                <div className="mt-8 w-full max-w-xl">
                    <div className="input-container flex items-end gap-2 w-full p-1 bg-white dark:bg-gray-800 rounded-2xl">
                        <AutoResizeTextarea
                            value={input}
                            onChange={onInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={heroPlaceholder}
                            disabled={isDisabled}
                            inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isDisabled}
                            className={cx(
                                "shrink-0 p-2.5 mb-0.5 mr-0.5 rounded-xl transition-colors",
                                input.trim() && !isDisabled
                                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    {apiError && (
                        <div className="mt-2">
                            <div className="text-red-500 text-xs text-center">{apiError}</div>
                            <ErrorActions onRegenerate={handleRegenerateClick} onFeedback={onFeedback} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className={cx(
                    "flex-1 overflow-y-auto p-4 scroll-smooth",
                    showModeTabs ? "pt-16" : "pt-4"
                )}
            >
                <div className="max-w-2xl mx-auto flex flex-col gap-5 pb-4">
                    {messages.map((m, idx) => {
                        const isUser = m.role === "user";
                        const isLast = idx === messages.length - 1;
                        const shouldAnimate = m.role === "assistant" && isLast && !m.isAnimated;
                        const showThinkingTime = !isUser && m.thinkingDuration !== undefined && m.thinkingDuration > 0;

                        return (
                            <div key={m.id} className={cx("flex gap-3 w-full", isUser ? "flex-row-reverse" : "flex-row")}>
                                {isUser ? (
                                    <AppAvatar
                                        src={authUser?.profileImage}
                                        alt={authUser?.name || "You"}
                                        size="sm"
                                        className="shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-white shadow-sm bg-gradient-to-br from-sky-400 to-blue-500">
                                        <Bot size={16} />
                                    </div>
                                )}

                                <div className={cx("flex flex-col max-w-[85%]", isUser && "items-end")}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {isUser ? "You" : "Assistant"}
                                        </span>
                                        {showThinkingTime && (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                · Thought for {m.thinkingDuration}s
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className={cx(
                                            "text-sm leading-relaxed",
                                            isUser
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-2xl rounded-tr-sm"
                                                : "text-gray-700 dark:text-gray-300 px-1"
                                        )}
                                    >
                                        {shouldAnimate ? (
                                            <TypewriterEffect content={m.content} onComplete={() => onMarkAnimated(m.id)} />
                                        ) : (
                                            <span className="whitespace-pre-wrap">{stripMarkdown(m.content)}</span>
                                        )}
                                    </div>

                                    {!isUser && m.dataSummary && <DataSummaryBadge summary={m.dataSummary} />}

                                    {!isUser && (
                                        <div className="flex items-center gap-2 mt-1.5 px-1">
                                            <button
                                                onClick={() => onCopy(m)}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1"
                                                title="Copy"
                                            >
                                                {copiedId === m.id ? <Check size={12} /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Loading: thinking timer + dots */}
                    {messageLoading && !isTransitioningPhase && thinkingStartTime && (
                        <div className="flex gap-3 w-full">
                            <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-white shadow-sm bg-gradient-to-br from-sky-400 to-blue-500">
                                <Bot size={16} />
                            </div>
                            <div className="flex flex-col gap-1 pt-1">
                                <ThinkingTimer startTime={thinkingStartTime} />
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Phase transition */}
                    {isTransitioningPhase && thinkingStartTime && (
                        <div className="flex gap-3 w-full">
                            <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-white shadow-sm bg-gradient-to-br from-sky-400 to-blue-500">
                                <Bot size={16} />
                            </div>
                            <div className="flex flex-col gap-1 pt-1">
                                <ThinkingTimer startTime={thinkingStartTime} />
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
                                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={endRef} />
                </div>
            </div>

            {/* Input bar */}
            <div className="shrink-0 p-4 bg-white dark:bg-gray-900">
                <div className="max-w-2xl mx-auto">
                    {apiError && (
                        <div className="mt-1 mb-2">
                            <ErrorActions onRegenerate={handleRegenerateClick} onFeedback={onFeedback} />
                        </div>
                    )}
                    <div className="input-container flex items-end gap-2 w-full p-1 bg-white dark:bg-gray-800 rounded-2xl">
                        <AutoResizeTextarea
                            value={input}
                            onChange={onInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Continue describing..."
                            disabled={isDisabled}
                            inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isDisabled}
                            className={cx(
                                "shrink-0 p-2 mb-0.5 mr-0.5 rounded-xl transition-colors",
                                input.trim() && !isDisabled
                                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChatPanel;

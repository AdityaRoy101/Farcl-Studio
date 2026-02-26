import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore, selectToken } from "../../../stores/auth";
import { type ChatMessage, makeId, CREATE_CONVERSATION_MUTATION, GET_PHASE_MUTATION, CONTINUE_CONVERSATION_V2_MUTATION } from "../studio.types";
import { getGqlErrors, getGqlData } from "../../../lib/graphql/gqlHelpers";
import type { Feature, AuthenticationData, Role, DiscoveryData, Entity, RestEndpoint, GraphQLAPI } from "../PhaseVisualization";

const STUDIO_GRAPHQL_URL =
    import.meta.env.VITE_GRAPHQL_URL ||
    "http://localhost:8001/v1/farcl";

// ---- Helpers ----

function safeParse(str: unknown): unknown {
    if (typeof str !== "string") return str;
    try { return JSON.parse(str); } catch { return str; }
}

// ---- Return type ----

export interface StudioConversationState {
    messages: ChatMessage[];
    input: string;
    copiedId: string | null;
    conversationId: string | null;
    backendPhase: string | null;
    creatingConversation: boolean;
    messageLoading: boolean;
    apiError: string | null;
    thinkingStartTime: number | null;
    isTransitioningPhase: boolean;
    isLoadingVisualization: boolean;
    discoveryData: DiscoveryData | null;
    features: Feature[];
    authData: AuthenticationData | null;
    roles: Role[];
    entities: Entity[];
    apiStyle: string | null;
    restEndpoints: RestEndpoint[];
    graphqlAPI: GraphQLAPI | null;
}

export interface StudioConversationActions {
    setInput: (v: string) => void;
    onSend: (overrideText?: string) => void;
    resetConversation: () => void;
    copyMsg: (m: ChatMessage) => void;
    markMessageAnimated: (id: string) => void;
    handleRegenerate: () => void;
    handleFeedback: () => void;
}

export function useStudioConversation(
    selectedProjectId: string,
    selectedWorkspaceId: string,
    hasWorkspaceSelected: boolean,
    hasProjectSelected: boolean
): StudioConversationState & StudioConversationActions {
    // Auth token from Zustand store — no localStorage reads here
    const token = useAuthStore(selectToken);

    // ---- State ----
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [backendPhase, setBackendPhase] = useState<string | null>(null);
    const [isInitialInPhase, setIsInitialInPhase] = useState(true);
    const [creatingConversation, setCreatingConversation] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [lastPrompt, setLastPrompt] = useState<string | null>(null);
    const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
    const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [authData, setAuthData] = useState<AuthenticationData | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [apiStyle, setApiStyle] = useState<string | null>(null);
    const [restEndpoints, setRestEndpoints] = useState<RestEndpoint[]>([]);
    const [graphqlAPI, setGraphqlAPI] = useState<GraphQLAPI | null>(null);
    const [isTransitioningPhase, setIsTransitioningPhase] = useState(false);
    const [isLoadingVisualization, setIsLoadingVisualization] = useState(false);

    // ---- AbortController — cancels in-flight requests on new send or unmount ----
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            // Cancel any in-flight fetch when the component that owns this hook unmounts
            abortRef.current?.abort();
        };
    }, []);

    // ---- Reset ----
    const resetConversation = useCallback(() => {
        setConversationId(null);
        setBackendPhase(null);
        setIsInitialInPhase(true);
        setMessages([]);
        setApiError(null);
        setLastPrompt(null);
        setIsTransitioningPhase(false);
        setDiscoveryData(null);
        setFeatures([]);
        setAuthData(null);
        setRoles([]);
        setEntities([]);
        setApiStyle(null);
        setRestEndpoints([]);
        setGraphqlAPI(null);
        setIsLoadingVisualization(false);
        setThinkingStartTime(null);
    }, []);

    // ---- GQL fetch helper ----
    const gqlFetch = useCallback(
        async (query: string, variables: Record<string, unknown>, signal?: AbortSignal) => {
            if (!token) throw new Error("Not authenticated");
            const res = await fetch(STUDIO_GRAPHQL_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query, variables }),
                signal,
            });
            const json = await res.json();
            const errors = getGqlErrors(json);
            if (errors.length) throw new Error(errors[0]?.message ?? "Unknown error");
            return getGqlData(json) as Record<string, unknown>;
        },
        [token]
    );

    // ---- Phase fetch (shares the active abort signal) ----
    const fetchPhase = useCallback(
        async (convId: string, signal?: AbortSignal): Promise<string | null> => {
            try {
                const data = await gqlFetch(GET_PHASE_MUTATION, { conversationId: convId }, signal);
                let phaseData = data?.getPhase;
                if (typeof phaseData === "string") {
                    try { phaseData = JSON.parse(phaseData); } catch { /* keep as string */ }
                }
                return (phaseData as Record<string, unknown>)?.next as string ?? null;
            } catch (e) {
                console.error("Failed to fetch phase", e);
                return null;
            }
        },
        [gqlFetch]
    );

    // ---- Process V2 response, update viz state ----
    const processV2Response = useCallback(
        (content: Record<string, unknown>): ChatMessage["dataSummary"] => {
            if (!content) return undefined;
            const summary: ChatMessage["dataSummary"] = {};

            if (content.project_name || content.core_problem || content.target_users) {
                setDiscoveryData((prev) => ({
                    ...prev,
                    project_name: (content.project_name as string) || prev?.project_name,
                    core_problem: (content.core_problem as string) || prev?.core_problem,
                    target_users: (content.target_users as string[]) || prev?.target_users,
                }));
            }

            if (Array.isArray(content.features) && content.features.length > 0) {
                setFeatures(content.features as Feature[]);
            }

            if (content.auth_required !== undefined || content.mfa_required !== undefined || content.methods) {
                setAuthData({
                    auth_required: (content.auth_required as boolean) ?? false,
                    mfa_required: (content.mfa_required as boolean) ?? false,
                    methods: (content.methods as string[]) || [],
                });
            }

            if (Array.isArray(content.roles) && content.roles.length > 0) {
                setRoles(content.roles as Role[]);
            }

            if (Array.isArray(content.entities) && content.entities.length > 0) {
                setEntities(content.entities as Entity[]);
                summary.entities = content.entities.length;
            }

            if (content.api_style) {
                setApiStyle(content.api_style as string);
            }

            if (Array.isArray(content.rest) && content.rest.length > 0) {
                setRestEndpoints(content.rest as RestEndpoint[]);
                summary.restEndpoints = content.rest.length;
            }

            if (content.graphql) {
                const gql = content.graphql as GraphQLAPI;
                setGraphqlAPI(gql);
                if (gql.queries) summary.graphqlQueries = gql.queries.length;
                if (gql.mutations) summary.graphqlMutations = gql.mutations.length;
            }

            const hasSummary = summary.entities || summary.restEndpoints || summary.graphqlQueries || summary.graphqlMutations;
            return hasSummary ? summary : undefined;
        },
        []
    );

    // ---- Continue conversation ----
    const callContinueV2 = useCallback(
        async (convId: string, message: string, isInitial: boolean, phase: string, signal?: AbortSignal) => {
            const data = await gqlFetch(CONTINUE_CONVERSATION_V2_MUTATION, {
                conversationId: convId,
                message,
                isInitialConversation: isInitial,
                phase,
                version: "V2",
                conversationStyle: "Software Developer"
            }, signal);
            return data?.continueCoversationV2;
        },
        [gqlFetch]
    );

    // ---- Start new phase ----
    const startNewPhase = useCallback(
        async (convId: string, phase: string, signal?: AbortSignal) => {
            const phaseStartTime = Date.now();
            setThinkingStartTime(phaseStartTime);
            try {
                const rawResponse = await callContinueV2(convId, "", true, phase, signal);
                const responseAny = rawResponse as Record<string, unknown> | string | null;
                const rawContent = typeof responseAny === "object" && responseAny !== null ? responseAny["content"] : responseAny;
                const content = safeParse(rawContent ?? rawResponse);

                const duration = Math.round((Date.now() - phaseStartTime) / 1000);

                if (content && typeof content === "object" && (content as any).message) {
                    const dataSummary = processV2Response(content as any);
                    setMessages((prev) => [
                        ...prev,
                        { id: makeId(), role: "assistant", content: (content as any).message as string, createdAt: Date.now(), isAnimated: false, thinkingDuration: duration, dataSummary },
                    ]);
                    setIsInitialInPhase(false);
                } else if (typeof content === "string" && (content as string).trim().toUpperCase() !== "END") {
                    setMessages((prev) => [
                        ...prev,
                        { id: makeId(), role: "assistant", content: content as string, createdAt: Date.now(), isAnimated: false, thinkingDuration: duration },
                    ]);
                    setIsInitialInPhase(false);
                }
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return; // navigation away — silent
                setApiError(e instanceof Error ? e.message : "Error starting phase");
            } finally {
                setIsTransitioningPhase(false);
                setIsLoadingVisualization(false);
                setThinkingStartTime(null);
            }
        },
        [callContinueV2, processV2Response]
    );

    // ---- Create conversation on mount / project change ----
    useEffect(() => {
        if (!hasWorkspaceSelected || !hasProjectSelected) {
            resetConversation();
            return;
        }
        if (conversationId || creatingConversation || apiError) return;
        if (!token) { setApiError("Not authenticated"); return; }

        setCreatingConversation(true);
        (async () => {
            try {
                const data = await gqlFetch(CREATE_CONVERSATION_MUTATION, {
                    projectId: selectedProjectId,
                    workspaceId: selectedWorkspaceId,
                });
                let conv = data?.createCoversation as Record<string, unknown>;
                if (typeof conv === "string") try { conv = JSON.parse(conv); } catch { /* noop */ }
                if (!conv?.id) throw new Error("No conversation ID");

                setConversationId(conv.id as string);
                const phase = await fetchPhase(conv.id as string);
                setBackendPhase(phase ?? "DISCOVERY");
                setIsInitialInPhase(true);
            } catch (e) {
                setApiError(e instanceof Error ? e.message : "Creation failed");
            } finally {
                setCreatingConversation(false);
            }
        })();
    }, [
        hasWorkspaceSelected,
        hasProjectSelected,
        conversationId,
        creatingConversation,
        apiError,
        selectedProjectId,
        selectedWorkspaceId,
        token,
        gqlFetch,
        fetchPhase,
        resetConversation,
    ]);

    // ---- Send message ----
    const onSend = useCallback(
        async (overrideText?: string) => {
            const text = overrideText ?? input.trim();
            if (!text || !conversationId || !backendPhase) return;

            // Cancel any previous in-flight request and start a fresh controller
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            const { signal } = controller;

            setApiError(null);
            setLastPrompt(text);

            const requestStartTime = Date.now();
            setThinkingStartTime(requestStartTime);

            if (!overrideText) {
                setMessages((prev) => [...prev, { id: makeId(), role: "user", content: text, createdAt: Date.now() }]);
                setInput("");
            }

            setMessageLoading(true);

            try {
                const rawResponse = await callContinueV2(conversationId, text, isInitialInPhase, backendPhase, signal);
                const responseAny = rawResponse as Record<string, unknown> | string | null;
                const rawContent = typeof responseAny === "object" && responseAny !== null ? responseAny["content"] : responseAny;
                const content = safeParse(rawContent ?? rawResponse) as Record<string, unknown>;

                if (signal.aborted) return; // navigated away after fetch resolved

                const isEnd =
                    (typeof content === "string" && (content as string).trim().toUpperCase() === "END") ||
                    (content as unknown) === "END";

                if (isEnd) {
                    setMessageLoading(false);
                    setIsTransitioningPhase(true);
                    setIsLoadingVisualization(true);

                    const nextPhase = await fetchPhase(conversationId);
                    if (nextPhase) {
                        setBackendPhase(nextPhase);
                        setIsInitialInPhase(true);
                        await startNewPhase(conversationId, nextPhase, signal);
                    } else {
                        const duration = Math.round((Date.now() - requestStartTime) / 1000);
                        setMessages((prev) => [
                            ...prev,
                            {
                                id: makeId(),
                                role: "assistant",
                                content: "Great! Your project configuration is complete. You can now proceed to build your application.",
                                createdAt: Date.now(),
                                isAnimated: false,
                                thinkingDuration: duration,
                            },
                        ]);
                        setIsTransitioningPhase(false);
                        setIsLoadingVisualization(false);
                        setThinkingStartTime(null);
                    }
                } else if (content && typeof content === "object" && content.message) {
                    const duration = Math.round((Date.now() - requestStartTime) / 1000);
                    const dataSummary = processV2Response(content);
                    setMessages((prev) => [
                        ...prev,
                        { id: makeId(), role: "assistant", content: content.message as string, createdAt: Date.now(), isAnimated: false, thinkingDuration: duration, dataSummary },
                    ]);
                    setIsInitialInPhase(false);
                    setMessageLoading(false);
                    setThinkingStartTime(null);
                } else if (typeof content === "string") {
                    const duration = Math.round((Date.now() - requestStartTime) / 1000);
                    setMessages((prev) => [
                        ...prev,
                        { id: makeId(), role: "assistant", content: content as string, createdAt: Date.now(), isAnimated: false, thinkingDuration: duration },
                    ]);
                    setIsInitialInPhase(false);
                    setMessageLoading(false);
                    setThinkingStartTime(null);
                }
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return; // silently ignore cancelled requests
                setApiError(e instanceof Error ? e.message : "Error sending message");
                setMessageLoading(false);
                setThinkingStartTime(null);
            }
        },
        [input, conversationId, backendPhase, isInitialInPhase, callContinueV2, fetchPhase, startNewPhase, processV2Response]
    );

    // ---- Copy message ----
    const copyMsg = useCallback(async (m: ChatMessage) => {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(m.content);
        }
        setCopiedId(m.id);
        setTimeout(() => setCopiedId((cur) => (cur === m.id ? null : cur)), 1500);
    }, []);

    const markMessageAnimated = useCallback((id: string) => {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isAnimated: true } : m)));
    }, []);

    const handleRegenerate = useCallback(() => {
        if (lastPrompt) {
            setApiError(null);
            onSend(lastPrompt);
        }
    }, [lastPrompt, onSend]);

    const handleFeedback = useCallback(() => {
        // TODO: wire up to feedback flow / Sentry report
    }, []);

    return {
        messages,
        input,
        copiedId,
        conversationId,
        backendPhase,
        creatingConversation,
        messageLoading,
        apiError,
        thinkingStartTime,
        isTransitioningPhase,
        isLoadingVisualization,
        discoveryData,
        features,
        authData,
        roles,
        entities,
        apiStyle,
        restEndpoints,
        graphqlAPI,
        setInput,
        onSend,
        resetConversation,
        copyMsg,
        markMessageAnimated,
        handleRegenerate,
        handleFeedback,
    };
}

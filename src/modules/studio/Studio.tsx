import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Database as DatabaseIcon,
  FileCode,
  Lock,
} from "lucide-react";

import { Header } from "../../components/Header/Header";
import { HeaderSkeleton } from "../../components/Skeleton/Skeleton";
import { useOrg, useWorkspace, useProject } from "../../contexts/workspace";
import { useAuthStore, selectUser } from "../../stores/auth";
import { useUserDisplayStore } from "../../stores/auth/userDisplay";

import { type Mode, cx } from "./studio.types";
import { useStudioConversation } from "./hooks/useStudioConversation";
import { ModeTabButton } from "./components/ModeTabButton";
import StudioEmptyState from "./components/StudioEmptyState";
import ChatPanel from "./components/ChatPanel";
import PhaseVisualizationV2 from "./PhaseVisualization";

// -------- Visualization Loader --------

function VisualizationLoader() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-12 min-h-[400px]">
      <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
        <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain" />
      </div>

      <div className="text-center mb-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Building Your Blueprint
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mx-auto">
          Generating project visualization...
        </p>
      </div>

      <div className="w-full max-w-md space-y-4 opacity-40">
        <div className="h-14 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl animate-pulse" />
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl animate-pulse w-5/6" />
        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl animate-pulse w-4/6" />
      </div>
    </div>
  );
}

// -------- Persistent panel width --------

function usePersistentNumber(key: string, initial: number) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : initial;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(key, String(value));
    }, 200); // debounced write
    return () => clearTimeout(timer);
  }, [key, value]);

  return [value, setValue] as const;
}

// -------- Rotating placeholder --------

const PLACEHOLDER_PROMPTS = [
  "Ex: A social media app where users can share posts...",
  "Ex: An e-commerce platform with real-time inventory...",
  "Ex: A project management tool with team collaboration...",
  "Ex: A fitness tracking app with personalized workouts...",
];

function useRotatingPlaceholder(active: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [active]);

  return PLACEHOLDER_PROMPTS[index];
}

// -------- Main component --------

export default function FarclStudioV2() {
  const { isLoading: orgLoading, tenants } = useOrg();
  const { selectedWorkspaceId, filteredWorkspaces } = useWorkspace();
  const { selectedProjectId, filteredProjects } = useProject();

  const authUser = useAuthStore(selectUser);
  const userNameFromAuth = authUser?.name;
  const storedName = useUserDisplayStore((s) => s.displayName);
  const setStoredName = useUserDisplayStore((s) => s.setDisplayName);

  useEffect(() => {
    const trimmed = userNameFromAuth?.trim();
    if (trimmed && trimmed !== storedName) setStoredName(trimmed);
  }, [userNameFromAuth, storedName, setStoredName]);

  const displayName =
    (storedName && storedName.trim()) ||
    (userNameFromAuth && userNameFromAuth.trim()) ||
    "there";

  const hasWorkspaceSelected = !!selectedWorkspaceId;
  const hasProjectSelected = !!selectedProjectId;

  // -------- Conversation hook --------
  const conv = useStudioConversation(
    selectedProjectId,
    selectedWorkspaceId,
    hasWorkspaceSelected,
    hasProjectSelected
  );

  // -------- UI state (layout only) --------
  const [mode, setMode] = useState<Mode>("chat");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [leftWidth, setLeftWidth] = usePersistentNumber("farcl_studio_v2_split_left_px", 700);
  const endRef = useRef<HTMLDivElement | null>(null);

  // -------- Derived flags --------
  const showSplitView = conv.features.length > 0;
  const showCenteredHero = conv.messages.length === 0 && !conv.messageLoading;
  const shouldShowCenteredView = !showSplitView;
  const shouldShowModeTabs = showSplitView;

  const conversationNotReady =
    !hasWorkspaceSelected ||
    !hasProjectSelected ||
    conv.creatingConversation ||
    !conv.conversationId ||
    !conv.backendPhase;

  const initError = conversationNotReady ? conv.apiError : null;

  const heroPlaceholder = useRotatingPlaceholder(showCenteredHero);

  // -------- Panel drag resize --------
  const safeSetLeftWidth = useCallback(
    (next: number) => {
      const el = containerRef.current;
      if (!el) return setLeftWidth(next);
      const total = el.getBoundingClientRect().width;
      const minLeft = total * 0.35;
      const maxLeft = total * 0.65;
      setLeftWidth(Math.max(minLeft, Math.min(maxLeft, next)));
    },
    [setLeftWidth]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const el = containerRef.current;
      if (!el) return;
      safeSetLeftWidth(e.clientX - el.getBoundingClientRect().left);
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [safeSetLeftWidth]);

  // Auto-scroll
  useEffect(() => {
    if (mode !== "chat") return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv.messages, conv.messageLoading, conv.isTransitioningPhase, mode]);

  // -------- Render --------
  return (
    <div className="min-h-screen h-screen text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
      <style>{`
        .chat-section {
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                      max-width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                      margin 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .right-pane {
          transition: opacity 0.5s ease-in-out,
                      transform 0.5s ease-in-out,
                      flex 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .divider {
          transition: opacity 0.4s ease-in-out, width 0.4s ease-in-out;
        }
        .input-container {
          border: 1px solid rgb(229, 231, 235);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .dark .input-container { border-color: rgb(55, 65, 81); }
        .input-container:focus-within {
          border-color: rgb(147, 197, 253);
          box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.15);
        }
        .dark .input-container:focus-within {
          border-color: rgb(96, 165, 250);
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
        }
      `}</style>

      {orgLoading ? <HeaderSkeleton /> : <Header />}

      <div className="flex-1 flex overflow-hidden bg-white dark:bg-gray-900">
        {conversationNotReady ? (
          (() => {
            if (!orgLoading) {
              const hasOrg = tenants.length > 0;
              const hasWorkspace = filteredWorkspaces.length > 0 && !!selectedWorkspaceId;
              const hasProject = filteredProjects.length > 0 && !!selectedProjectId;

              if (!hasOrg) return <StudioEmptyState missing="organisation" />;
              if (!hasWorkspace) return <StudioEmptyState missing="workspace" />;
              if (!hasProject) return <StudioEmptyState missing="project" />;
            }

            return (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  {initError ? (
                    <>
                      <p className="text-xs text-red-500 text-center max-w-sm">{initError}</p>
                      <button
                        type="button"
                        onClick={() => conv.resetConversation()}
                        className="mt-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                      >
                        Retry
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full border-[2.5px] border-gray-200 dark:border-gray-700 border-t-sky-400 border-r-blue-500 animate-spin" />
                      <p className="text-xs text-gray-400 dark:text-gray-500">Initializing...</p>
                    </>
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          <div ref={containerRef} className="flex-1 min-w-0 h-full flex relative">
            {/* LEFT PANE */}
            <section
              className={cx(
                "chat-section flex flex-col relative bg-white dark:bg-gray-900 h-full",
                shouldShowCenteredView && "mx-auto"
              )}
              style={{
                width: shouldShowCenteredView ? "100%" : `${leftWidth}px`,
                maxWidth: shouldShowCenteredView ? "900px" : "none",
                flexShrink: shouldShowCenteredView ? 1 : 0,
              }}
            >
              {/* Mode Tabs */}
              {shouldShowModeTabs && (
                <div className="absolute z-10 top-4 left-4">
                  <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                    <ModeTabButton
                      active={mode === "chat"}
                      onClick={() => setMode("chat")}
                      icon={MessageSquare}
                      label="Chat"
                    />
                    <ModeTabButton
                      active={mode === "database"}
                      onClick={() => setMode("database")}
                      icon={DatabaseIcon}
                      label="Database"
                      disabled
                    />
                    <ModeTabButton
                      active={mode === "editor"}
                      onClick={() => setMode("editor")}
                      label="Editor"
                      disabled
                      customIcon={<FileCode size={14} />}
                    />
                  </div>
                </div>
              )}

              {mode === "chat" ? (
                <ChatPanel
                  messages={conv.messages}
                  input={conv.input}
                  messageLoading={conv.messageLoading}
                  isTransitioningPhase={conv.isTransitioningPhase}
                  thinkingStartTime={conv.thinkingStartTime}
                  apiError={conv.apiError}
                  copiedId={conv.copiedId}
                  authUser={authUser}
                  showCenteredHero={showCenteredHero}
                  heroPlaceholder={heroPlaceholder}
                  showModeTabs={shouldShowModeTabs}
                  onInputChange={(e) => conv.setInput(e.target.value)}
                  onSend={conv.onSend}
                  onCopy={conv.copyMsg}
                  onMarkAnimated={conv.markMessageAnimated}
                  onRegenerate={conv.handleRegenerate}
                  onFeedback={conv.handleFeedback}
                  displayName={displayName}
                  endRef={endRef as React.RefObject<HTMLDivElement>}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Lock size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Coming Soon</p>
                  </div>
                </div>
              )}
            </section>

            {/* DIVIDER */}
            <div
              className={cx(
                "divider relative group cursor-col-resize bg-gray-200 dark:bg-black-800 z-30",
                shouldShowCenteredView
                  ? "opacity-0 w-0 pointer-events-none"
                  : "opacity-100 w-px hover:w-2 bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-700"
              )}
              onMouseDown={() => {
                if (!shouldShowCenteredView) {
                  draggingRef.current = true;
                  document.body.style.cursor = "col-resize";
                  document.body.style.userSelect = "none";
                }
              }}
            />

            {/* RIGHT PANE */}
            <section
              className={cx(
                "right-pane min-w-0 h-full bg-gray-50 dark:bg-gray-900 overflow-hidden",
                shouldShowCenteredView
                  ? "flex-[0] opacity-0 translate-x-8"
                  : "flex-1 opacity-100 translate-x-0"
              )}
            >
              {conv.isLoadingVisualization ? (
                <VisualizationLoader />
              ) : (
                <PhaseVisualizationV2
                  discoveryData={conv.discoveryData}
                  features={conv.features}
                  authData={conv.authData}
                  roles={conv.roles}
                  entities={conv.entities}
                  apiStyle={conv.apiStyle}
                  restEndpoints={conv.restEndpoints}
                  graphqlAPI={conv.graphqlAPI}
                  activePhase={conv.backendPhase}
                />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
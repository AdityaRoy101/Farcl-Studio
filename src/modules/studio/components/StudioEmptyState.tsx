import { Building2, FolderOpen, Layers, Check, ArrowRight } from "lucide-react";
import React from "react";
import { cx } from "../studio.types";

type EmptyStateStep = "organisation" | "workspace" | "project";

const EMPTY_STATE_CONFIG: Record<
    EmptyStateStep,
    {
        icon: React.ElementType;
        gradient: string;
        iconBg: string;
        title: string;
        description: string;
        hint: string;
        steps: { label: string; done: boolean }[];
    }
> = {
    organisation: {
        icon: Building2,
        gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
        iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
        title: "Create an Organisation to get started",
        description:
            "Studio needs an organisation, a workspace, and a project before it can help you build. Start by creating your organisation.",
        hint: "Use the selector in the top navigation bar to create your first organisation.",
        steps: [
            { label: "Create an Organisation", done: false },
            { label: "Add a Workspace", done: false },
            { label: "Create a Project", done: false },
        ],
    },
    workspace: {
        icon: Layers,
        gradient: "from-sky-500/10 via-blue-500/5 to-transparent",
        iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
        title: "Add a Workspace to continue",
        description:
            "Great — your organisation is set up! Now create a workspace to organise your projects and unlock Studio.",
        hint: "Open the workspace selector in the top bar and create a new workspace inside your organisation.",
        steps: [
            { label: "Organisation created", done: true },
            { label: "Add a Workspace", done: false },
            { label: "Create a Project", done: false },
        ],
    },
    project: {
        icon: FolderOpen,
        gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        title: "Create a Project to launch Studio",
        description:
            "Almost there! Create a project inside your workspace and Studio will be ready to help you design your application.",
        hint: "Use the project selector in the top bar to create a new project in your workspace.",
        steps: [
            { label: "Organisation created", done: true },
            { label: "Workspace ready", done: true },
            { label: "Create a Project", done: false },
        ],
    },
};

function StudioEmptyState({ missing }: { missing: EmptyStateStep }) {
    const cfg = EMPTY_STATE_CONFIG[missing];
    const Icon = cfg.icon;

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative max-w-md w-full">
                <div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${cfg.gradient} blur-2xl -z-10`}
                />

                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-100/60 dark:shadow-black/30 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                    <div className="p-8">
                        <div className={`w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center mb-6 shadow-sm`}>
                            <Icon size={26} strokeWidth={1.6} />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
                            {cfg.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-7">
                            {cfg.description}
                        </p>

                        <div className="space-y-2.5 mb-7">
                            {cfg.steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div
                                        className={cx(
                                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors",
                                            step.done
                                                ? "bg-emerald-500 text-white"
                                                : i === cfg.steps.findIndex((s) => !s.done)
                                                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 ring-4 ring-gray-900/10 dark:ring-gray-100/10"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                                        )}
                                    >
                                        {step.done ? <Check size={10} strokeWidth={3} /> : i + 1}
                                    </div>
                                    <span
                                        className={cx(
                                            "text-sm",
                                            step.done
                                                ? "text-gray-400 dark:text-gray-500 line-through"
                                                : i === cfg.steps.findIndex((s) => !s.done)
                                                    ? "text-gray-900 dark:text-gray-100 font-medium"
                                                    : "text-gray-400 dark:text-gray-600"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
                            <ArrowRight size={14} className="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {cfg.hint}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { EmptyStateStep };
export default StudioEmptyState;

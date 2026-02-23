import { Lock } from "lucide-react";

export function ChecklistContent() {
  const placeholderItems = [
    "Set up project structure and dependencies",
    "Configure authentication and user management",
    "Design and implement database schema",
    "Create API endpoints for core features",
    "Implement frontend components and views",
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">Project tasks and requirements</p>
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          0/5 completed
        </span>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-gray-900/60 dark:to-gray-900 z-10 flex items-center justify-center">
          <div className="text-center p-4">
            <Lock size={20} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Coming Soon</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Checklist will be available soon</p>
          </div>
        </div>

        <div className="space-y-2 filter blur-[2px] pointer-events-none select-none">
          {placeholderItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

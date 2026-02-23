import { Layers } from "lucide-react";

export function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3">
        <Layers size={20} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Project Blueprint
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
        Your project details will appear here as you describe your app.
      </p>
    </div>
  );
}

import { cx } from "../../PhaseVisualization.types";

import type { ElementType } from "react";

export function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: ElementType;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
        active
          ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <Icon size={14} />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cx(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            active
              ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

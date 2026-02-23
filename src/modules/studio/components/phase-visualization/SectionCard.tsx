import { useState, type ElementType, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cx } from "../../PhaseVisualization.types";

export function SectionCard({
  title,
  icon: Icon,
  count,
  children,
  defaultExpanded = true,
  iconColor = "text-gray-500 dark:text-gray-400",
  headerAccent,
}: {
  title: string;
  icon: ElementType;
  count?: number;
  children: ReactNode;
  defaultExpanded?: boolean;
  iconColor?: string;
  headerAccent?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-3 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cx(
          "w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
          headerAccent
        )}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} className={iconColor} />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</span>
          {count !== undefined && (
            <span className="text-xs text-gray-400 dark:text-gray-500">({count})</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

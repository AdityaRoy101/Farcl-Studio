import { Users } from "lucide-react";

import { type DiscoveryData } from "../../PhaseVisualization.types";

export function ProjectHeader({ data }: { data: DiscoveryData }) {
  if (
    !data.project_name &&
    !data.core_problem &&
    (!data.target_users || data.target_users.length === 0)
  ) {
    return null;
  }

  return (
    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
      {data.project_name && (
        <div className="mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            App Name
          </span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
            {data.project_name}
          </h2>
        </div>
      )}

      {data.core_problem && (
        <div className="mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Core Problem
          </span>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
            {data.core_problem}
          </p>
        </div>
      )}

      {data.target_users && data.target_users.length > 0 && (
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Target Users
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {data.target_users.map((user, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/50"
              >
                <Users size={10} />
                {user}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Globe, Lock } from "lucide-react";

import {
  type GraphQLAPI,
  type RestEndpoint,
  cx,
} from "../../PhaseVisualization.types";
import { SectionCard } from "./SectionCard";

export function APICard({
  apiStyle,
  restEndpoints,
  graphqlAPI,
  defaultExpanded,
}: {
  apiStyle: string | null;
  restEndpoints: RestEndpoint[];
  graphqlAPI: GraphQLAPI | null;
  defaultExpanded?: boolean;
}) {
  const [activeMethodFilter, setActiveMethodFilter] = useState<string | null>(null);

  if (!apiStyle && restEndpoints.length === 0 && !graphqlAPI) return null;

  const methodConfig: Record<
    string,
    { bg: string; text: string; border: string; lightBg: string }
  > = {
    GET: {
      bg: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800/50",
      lightBg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    POST: {
      bg: "bg-blue-500",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800/50",
      lightBg: "bg-blue-50 dark:bg-blue-900/20",
    },
    PUT: {
      bg: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800/50",
      lightBg: "bg-amber-50 dark:bg-amber-900/20",
    },
    PATCH: {
      bg: "bg-orange-500",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800/50",
      lightBg: "bg-orange-50 dark:bg-orange-900/20",
    },
    DELETE: {
      bg: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800/50",
      lightBg: "bg-red-50 dark:bg-red-900/20",
    },
  };

  const methods = ["GET", "POST", "PUT", "DELETE"];
  const methodCounts = methods.reduce((acc, method) => {
    if (method === "PUT") {
      acc[method] = restEndpoints.filter((e) => e.method === "PUT" || e.method === "PATCH").length;
    } else {
      acc[method] = restEndpoints.filter((e) => e.method === method).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredEndpoints = activeMethodFilter
    ? restEndpoints.filter((e) => {
        if (activeMethodFilter === "PUT") {
          return e.method === "PUT" || e.method === "PATCH";
        }
        return e.method === activeMethodFilter;
      })
    : restEndpoints;

  const graphqlCount = graphqlAPI
    ? graphqlAPI.queries.length + graphqlAPI.mutations.length + (graphqlAPI.subscriptions?.length ?? 0)
    : 0;

  const totalEndpoints = restEndpoints.length + graphqlCount;

  return (
    <SectionCard
      title="API"
      icon={Globe}
      count={totalEndpoints}
      iconColor="text-cyan-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-4">
        {apiStyle && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>API Style:</span>
            <span className="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {apiStyle}
            </span>
          </div>
        )}

        {restEndpoints.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">REST Endpoints</p>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {restEndpoints.length} total
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setActiveMethodFilter(null)}
                className={cx(
                  "text-xs px-2.5 py-1 rounded-full transition-all font-medium",
                  activeMethodFilter === null
                    ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                All ({restEndpoints.length})
              </button>
              {methods.map((method) => {
                const config = methodConfig[method];
                const count = methodCounts[method];
                if (count === 0) return null;

                return (
                  <button
                    key={method}
                    onClick={() => setActiveMethodFilter(activeMethodFilter === method ? null : method)}
                    className={cx(
                      "text-xs px-2.5 py-1 rounded-full transition-all font-medium border",
                      activeMethodFilter === method
                        ? `${config.bg} text-white border-transparent`
                        : `${config.lightBg} ${config.text} ${config.border} hover:opacity-80`
                    )}
                  >
                    {method} ({count})
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredEndpoints.map((endpoint, idx) => {
                const config = methodConfig[endpoint.method] || methodConfig.GET;

                return (
                  <div
                    key={idx}
                    className={cx(
                      "flex items-center gap-3 p-2.5 rounded-lg border transition-all hover:shadow-sm",
                      config.lightBg,
                      config.border
                    )}
                  >
                    <span
                      className={cx(
                        "text-[10px] font-bold px-2 py-1 rounded text-white shrink-0 min-w-[52px] text-center",
                        config.bg
                      )}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 break-all">
                      {endpoint.path}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {endpoint.authRequired && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                          <Lock size={8} />
                          Auth
                        </span>
                      )}
                      {endpoint.roles && endpoint.roles.length > 0 && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {endpoint.roles.length} role{endpoint.roles.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {graphqlAPI && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                GraphQL Operations
              </p>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {graphqlCount} total
              </span>
            </div>

            {graphqlAPI.queries.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide">Queries</p>
                <div className="space-y-1.5">
                  {graphqlAPI.queries.map((query, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/50"
                    >
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">Q</span>
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1">{query.name}</span>
                      {query.authRequired && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                          <Lock size={8} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {graphqlAPI.mutations.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide">Mutations</p>
                <div className="space-y-1.5">
                  {graphqlAPI.mutations.map((mutation, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50"
                    >
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white">M</span>
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1">{mutation.name}</span>
                      {mutation.authRequired && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                          <Lock size={8} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {graphqlAPI.subscriptions && graphqlAPI.subscriptions.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide">Subscriptions</p>
                <div className="space-y-1.5">
                  {graphqlAPI.subscriptions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-100 dark:border-purple-800/50"
                    >
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500 text-white">S</span>
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1">{sub.name}</span>
                      {sub.authRequired && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                          <Lock size={8} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

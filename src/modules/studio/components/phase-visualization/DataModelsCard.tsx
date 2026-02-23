import { useState } from "react";
import { ChevronDown, ChevronUp, Database, Link2 } from "lucide-react";

import {
  type Entity,
  cx,
  entityColors,
  getFieldTypeColor,
  getFieldTypeIcon,
} from "../../PhaseVisualization.types";
import { SectionCard } from "./SectionCard";

export function DataModelsCard({
  entities,
  defaultExpanded,
}: {
  entities: Entity[];
  defaultExpanded?: boolean;
}) {
  const [expandedEntity, setExpandedEntity] = useState<string | null>(entities[0]?.name || null);

  if (entities.length === 0) return null;

  return (
    <SectionCard
      title="Data Models"
      icon={Database}
      count={entities.length}
      iconColor="text-blue-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-3">
        {entities.map((entity, idx) => {
          const colorSet = entityColors[idx % entityColors.length];
          const isExpanded = expandedEntity === entity.name;

          return (
            <div
              key={entity.name}
              className={cx(
                "rounded-lg border overflow-hidden transition-all",
                isExpanded ? colorSet.border : "border-gray-200 dark:border-gray-700"
              )}
            >
              <button
                onClick={() => setExpandedEntity(isExpanded ? null : entity.name)}
                className={cx(
                  "w-full px-3 py-2.5 flex items-center justify-between transition-colors",
                  isExpanded ? colorSet.header : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <Database size={14} className={isExpanded ? colorSet.icon : "text-gray-400"} />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{entity.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cx(
                      "text-[10px] px-2 py-0.5 rounded-full",
                      isExpanded
                        ? "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {entity.fields.length} fields
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 bg-white dark:bg-gray-800/50">
                  <div className="mt-2 space-y-1.5">
                    {entity.fields.map((field) => {
                      const FieldIcon = getFieldTypeIcon(field.type);
                      const typeColor = getFieldTypeColor(field.type);

                      return (
                        <div
                          key={field.name}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={cx("p-1 rounded", typeColor)}>
                              <FieldIcon size={10} />
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.name}</span>
                            {field.primary && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                                PK
                              </span>
                            )}
                            {field.unique && !field.primary && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                                UQ
                              </span>
                            )}
                          </div>
                          <span className={cx("text-xs px-2 py-0.5 rounded-full", typeColor)}>{field.type}</span>
                        </div>
                      );
                    })}
                  </div>

                  {entity.relationships && entity.relationships.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                        <Link2 size={12} />
                        Relationships
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {entity.relationships.map((rel, rIdx) => (
                          <span
                            key={rIdx}
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50"
                          >
                            <Link2 size={10} />
                            <span className="font-medium">{rel.with}</span>
                            <span className="text-indigo-400 dark:text-indigo-500">({rel.type.replace("_", " ")})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

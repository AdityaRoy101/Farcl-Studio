import { Boxes, Zap } from "lucide-react";

import { type Feature, cx, featureColors } from "../../PhaseVisualization.types";
import { SectionCard } from "./SectionCard";

export function FeaturesList({
  features,
  defaultExpanded,
}: {
  features: Feature[];
  defaultExpanded?: boolean;
}) {
  if (features.length === 0) return null;

  return (
    <SectionCard
      title="Features"
      icon={Boxes}
      count={features.length}
      iconColor="text-violet-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-2">
        {features.map((feature, idx) => {
          const colorSet = featureColors[idx % featureColors.length];
          return (
            <div
              key={feature.id}
              className={cx(
                "flex items-start gap-3 py-2.5 px-3 rounded-lg border-l-3",
                colorSet.border,
                "border border-transparent"
              )}
              style={{ borderLeftWidth: "3px" }}
            >
              <div className="mt-0.5 text-gray-400 dark:text-gray-500">
                <Zap size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{feature.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {feature.short_description}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1.5 py-0.5">
                #{idx + 1}
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

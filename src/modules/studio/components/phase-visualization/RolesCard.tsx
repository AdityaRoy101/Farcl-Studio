import { Check, UserCog } from "lucide-react";

import { type Role, cx, roleColors } from "../../PhaseVisualization.types";
import { SectionCard } from "./SectionCard";

export function RolesCard({
  roles,
  defaultExpanded,
}: {
  roles: Role[];
  defaultExpanded?: boolean;
}) {
  if (roles.length === 0) return null;

  return (
    <SectionCard
      title="Roles & Permissions"
      icon={UserCog}
      count={roles.length}
      iconColor="text-purple-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-3">
        {roles.map((role, idx) => {
          const colorSet = roleColors[idx % roleColors.length];
          return (
            <div key={role.role} className={cx("rounded-lg border overflow-hidden", colorSet.border)}>
              <div className={cx("px-3 py-2.5 border-b", colorSet.bg, colorSet.border)}>
                <div className="flex items-center gap-2">
                  <UserCog size={14} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{role.role}</span>
                  <span className={cx("text-[10px] px-1.5 py-0.5 rounded-full ml-auto", colorSet.badge)}>
                    {role.permissions.length} permissions
                  </span>
                </div>
              </div>
              {role.permissions.length > 0 && (
                <div className="p-3 bg-white dark:bg-gray-800/50">
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((perm, pIdx) => (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md"
                      >
                        <Check size={10} className="text-emerald-500" />
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

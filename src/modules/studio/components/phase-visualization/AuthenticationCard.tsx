import { Check, Key, Lock, Shield } from "lucide-react";

import { type AuthenticationData, cx } from "../../PhaseVisualization.types";
import { SectionCard } from "./SectionCard";

export function AuthenticationCard({
  data,
  defaultExpanded,
}: {
  data: AuthenticationData;
  defaultExpanded?: boolean;
}) {
  return (
    <SectionCard
      title="Authentication"
      icon={Shield}
      iconColor="text-emerald-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Authentication Required</span>
          </div>
          <span
            className={cx(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              data.auth_required
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            )}
          >
            {data.auth_required ? "✓ Yes" : "No"}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Multi-Factor Auth (MFA)</span>
          </div>
          <span
            className={cx(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              data.mfa_required
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            )}
          >
            {data.mfa_required ? "✓ Enabled" : "Disabled"}
          </span>
        </div>

        {data.methods && data.methods.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Key size={12} />
              Authentication Methods
            </p>
            <div className="grid grid-cols-2 gap-2">
              {data.methods.map((method, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/50"
                >
                  <Check size={12} className="text-emerald-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{method}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

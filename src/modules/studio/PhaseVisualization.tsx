import { useState } from "react";
import { LayoutGrid, ListTodo } from "lucide-react";

import {
  type Feature,
  type AuthenticationData,
  type Role,
  type DiscoveryData,
  type Entity,
  type RestEndpoint,
  type GraphQLAPI,
} from "./PhaseVisualization.types";

import { ChecklistContent } from "./components/phase-visualization/ChecklistContent";
import { EmptyState } from "./components/phase-visualization/EmptyState";
import { TabButton } from "./components/phase-visualization/TabButton";
import { VisualizationContent } from "./components/phase-visualization/VisualizationContent";

type PhaseVisualizationV2Props = {
  discoveryData: DiscoveryData | null;
  features: Feature[];
  authData: AuthenticationData | null;
  roles: Role[];
  entities: Entity[];
  apiStyle: string | null;
  restEndpoints: RestEndpoint[];
  graphqlAPI: GraphQLAPI | null;
  activePhase?: string | null;
};

export default function PhaseVisualizationV2({
  discoveryData,
  features,
  authData,
  roles,
  entities,
  apiStyle,
  restEndpoints,
  graphqlAPI,
  activePhase,
}: PhaseVisualizationV2Props) {
  const [activeTab, setActiveTab] = useState<'checklist' | 'visual'>('visual');

  const hasContent =
    features.length > 0 ||
    (authData !== null && (authData.auth_required || authData.methods.length > 0)) ||
    roles.length > 0 ||
    entities.length > 0 ||
    restEndpoints.length > 0 ||
    graphqlAPI !== null;

  if (!hasContent && !discoveryData) {
    return <EmptyState />;
  }

  const visualCount =
    (features.length > 0 ? 1 : 0) +
    (authData ? 1 : 0) +
    (roles.length > 0 ? 1 : 0) +
    (entities.length > 0 ? 1 : 0) +
    ((restEndpoints.length > 0 || graphqlAPI) ? 1 : 0);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Tab Header */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          <TabButton
            active={activeTab === 'checklist'}
            onClick={() => setActiveTab('checklist')}
            icon={ListTodo}
            label="Checklist"
            count={5}
          />
          <TabButton
            active={activeTab === 'visual'}
            onClick={() => setActiveTab('visual')}
            icon={LayoutGrid}
            label="Visual Cards"
            count={visualCount}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'checklist' ? (
          <ChecklistContent />
        ) : (
          <VisualizationContent
            key={activePhase || 'default'}
            discoveryData={discoveryData}
            features={features}
            authData={authData}
            roles={roles}
            entities={entities}
            apiStyle={apiStyle}
            restEndpoints={restEndpoints}
            graphqlAPI={graphqlAPI}
            activePhase={activePhase}
          />
        )}
      </div>
    </div>
  );
}

export type {
  Feature,
  AuthenticationData,
  Role,
  DiscoveryData,
  Entity,
  RestEndpoint,
  GraphQLAPI,
};
import { Layers } from "lucide-react";

import {
  type AuthenticationData,
  type DiscoveryData,
  type Entity,
  type Feature,
  type GraphQLAPI,
  type RestEndpoint,
  cx,
} from "../../PhaseVisualization.types";

import { APICard } from "./APICard";
import { AuthenticationCard } from "./AuthenticationCard";
import { DataModelsCard } from "./DataModelsCard";
import { FeaturesList } from "./FeaturesList";
import { ProjectHeader } from "./ProjectHeader";
import { RolesCard } from "./RolesCard";

export type VisualizationContentProps = {
  discoveryData: DiscoveryData | null;
  features: Feature[];
  authData: AuthenticationData | null;
  roles: import("../../PhaseVisualization.types").Role[];
  entities: Entity[];
  apiStyle: string | null;
  restEndpoints: RestEndpoint[];
  graphqlAPI: GraphQLAPI | null;
  activePhase?: string | null;
};

export function VisualizationContent({
  discoveryData,
  features,
  authData,
  roles,
  entities,
  apiStyle,
  restEndpoints,
  graphqlAPI,
  activePhase,
}: VisualizationContentProps) {
  const hasContent =
    features.length > 0 ||
    (authData !== null && (authData.auth_required || authData.methods.length > 0)) ||
    roles.length > 0 ||
    entities.length > 0 ||
    restEndpoints.length > 0 ||
    graphqlAPI !== null;

  if (!hasContent) {
    return (
      <div className="p-4 text-center py-12">
        <Layers size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No visualizations yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Details will appear as you describe your app
        </p>
      </div>
    );
  }

  const getIsActive = (section: string) => {
    if (!activePhase) return true;
    const p = activePhase.toUpperCase();

    if (section === "FEATURES") {
      return p.includes("DISCOVERY");
    }
    if (section === "AUTH") {
      return p.includes("AUTHENTICATION");
    }
    if (section === "ROLES") {
      return p.includes("AUTHORIZATION");
    }
    if (section === "DATAMODELS") {
      return p.includes("DATAMODELS");
    }
    if (section === "API") {
      return p.includes("API");
    }

    return false;
  };

  return (
    <div className={cx("p-4")}>
      {discoveryData && <ProjectHeader data={discoveryData} />}
      <FeaturesList features={features} defaultExpanded={getIsActive("FEATURES")} />
      {authData && <AuthenticationCard data={authData} defaultExpanded={getIsActive("AUTH")} />}
      <RolesCard roles={roles} defaultExpanded={getIsActive("ROLES")} />
      <DataModelsCard entities={entities} defaultExpanded={getIsActive("DATA")} />
      <APICard
        apiStyle={apiStyle}
        restEndpoints={restEndpoints}
        graphqlAPI={graphqlAPI}
        defaultExpanded={getIsActive("API")}
      />
      <div className="h-4" />
    </div>
  );
}

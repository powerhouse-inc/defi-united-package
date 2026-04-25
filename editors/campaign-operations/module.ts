import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Drive editor module for the per-campaign drive */
export const CampaignOperations: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/document-drive"],
  config: {
    id: "campaign-operations",
    name: "Campaign Operations",
  },
};

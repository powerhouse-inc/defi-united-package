import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "defi-united/distribution-plan" document type */
export const DistributionPlanEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["defi-united/distribution-plan"],
  config: {
    id: "distribution-plan-editor",
    name: "Distribution Plan",
  },
};

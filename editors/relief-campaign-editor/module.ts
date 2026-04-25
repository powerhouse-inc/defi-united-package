import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "defi-united/relief-campaign" document type */
export const ReliefCampaignEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["defi-united/relief-campaign"],
  config: {
    id: "relief-campaign-editor",
    name: "Relief Campaign",
  },
};

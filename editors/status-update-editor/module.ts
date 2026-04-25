import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "defi-united/status-update" document type */
export const StatusUpdateEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["defi-united/status-update"],
  config: {
    id: "status-update-editor",
    name: "Status Update",
  },
};

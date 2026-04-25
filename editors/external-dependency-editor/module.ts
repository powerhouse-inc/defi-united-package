import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "defi-united/external-dependency" document type */
export const ExternalDependencyEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["defi-united/external-dependency"],
  config: {
    id: "external-dependency-editor",
    name: "External Dependency",
  },
};

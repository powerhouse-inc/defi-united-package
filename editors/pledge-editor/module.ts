import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "defi-united/pledge" document type */
export const PledgeEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["defi-united/pledge"],
  config: {
    id: "pledge-editor",
    name: "Pledge",
  },
};

import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "defi-united/contributor-profile" document type */
export const ContributorProfileEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["defi-united/contributor-profile"],
  config: {
    id: "contributor-profile-editor",
    name: "Contributor Profile",
  },
};

import { BaseSubgraph } from "@powerhousedao/reactor-api";
import type { DocumentNode } from "graphql";
import { getResolvers } from "./resolvers.js";
import { schema } from "./schema.js";
import {
  setupDocumentChangeListener,
  teardownDocumentChangeListener,
} from "./resolvers.js";

export class PublicCampaignSubgraph extends BaseSubgraph {
  name = "defi-united-public-campaign";
  hasSubscriptions = true;
  typeDefs: DocumentNode = schema;
  resolvers = getResolvers(this);
  additionalContextFields = {};

  async onSetup() {
    await setupDocumentChangeListener(this);
  }

  async onDisconnect() {
    teardownDocumentChangeListener();
  }
}

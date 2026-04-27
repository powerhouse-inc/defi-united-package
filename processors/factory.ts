import type {
  IProcessorHostModule,
  ProcessorRecord,
} from "@powerhousedao/reactor-browser";
import type { PHDocumentHeader } from "document-model";
import type { ProcessorFactory } from "@powerhousedao/reactor";
import { buildOnchainReceiptWatcher } from "./onchain-receipt-watcher/index.js";

/**
 * Processor factory that aggregates all registered processors.
 *
 * Each entry in PROCESSOR_BUILDERS is a factory builder that receives the
 * host module and returns a ProcessorFactory. The returned factory is then
 * called per-drive to produce ProcessorRecord instances.
 */
const PROCESSOR_BUILDERS: ((
  module: IProcessorHostModule,
) => ProcessorFactory)[] = [buildOnchainReceiptWatcher];

export const processorFactory = async (
  module: IProcessorHostModule,
): Promise<(driveHeader: PHDocumentHeader) => Promise<ProcessorRecord[]>> => {
  // Build all factories upfront using the shared module context
  const factories = PROCESSOR_BUILDERS.map((buildFactory) =>
    buildFactory(module),
  );

  // Return the inner function that will be called for each drive
  return async (driveHeader: PHDocumentHeader): Promise<ProcessorRecord[]> => {
    const processors: ProcessorRecord[] = [];

    for (const factory of factories) {
      const factoryProcessors = await factory(driveHeader, module.processorApp);
      processors.push(...factoryProcessors);
    }

    return processors;
  };
};

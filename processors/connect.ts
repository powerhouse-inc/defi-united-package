/**
 * Connect-specific processor factory builders.
 *
 * Processors registered here only run when the host app is "connect".
 * The defi-united package does not require any connect-side processors;
 * all processing runs on switchboard.
 */
import type { ProcessorFactoryBuilder } from "@powerhousedao/reactor";

export const processorFactoryBuilders: ProcessorFactoryBuilder[] = [];

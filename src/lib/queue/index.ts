/**
 * /lib/queue — Public exports
 *
 * Import queue utilities from this barrel file.
 * Do not import queue internals directly — use this module.
 *
 * Usage (in API route):
 *   import { processQueue, getQueueHealth } from "@/lib/queue";
 */

export { processQueue, getQueueHealth } from "./queue.processor";
export type {
  QueueProcessOptions,
  QueueJobResult,
  ProcessResult,
  QueueHealthStatus,
} from "./queue.processor";

// apps/web/src/shared/lib/offline/types.ts
/**
 * Offline Queue Types — Zod schemas and TypeScript interfaces for form queue.
 *
 * Provides:
 * - FormQueueItem schema and type
 * - Idempotency key generation
 * - Queue constants
 */

import { z } from 'zod';

// ============================================================================
// Constants
// ============================================================================

/**
 * IndexedDB key for the form queue.
 */
export const QUEUE_KEY = 'ganatrack-form-queue';

/**
 * Maximum number of items in the form queue.
 * When exceeded, oldest items are evicted (FIFO).
 */
export const MAX_QUEUE_SIZE = 50;

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Valid form types that can be queued.
 */
export const FormTypeEnum = z.enum(['animal', 'palpacion', 'parto']);

/**
 * Valid queue item statuses.
 */
export const QueueStatusEnum = z.enum([
  'pending',
  'submitting',
  'failed',
  'completed',
]);

/**
 * Valid HTTP methods for queue items (mutations only).
 */
export const HttpMethodEnum = z.enum(['POST', 'PUT']);

/**
 * Zod schema for a form queue item.
 * Validates data before enqueueing to IndexedDB.
 */
export const formQueueItemSchema = z.object({
  id: z.string().uuid(),
  formType: FormTypeEnum,
  payload: z.record(z.unknown()),
  idempotencyKey: z.string(),
  endpoint: z.string().min(1),
  method: HttpMethodEnum,
  expectedVersion: z.number().int().positive().optional(),
  predioId: z.number().int().positive(),
  createdAt: z.number().int(),
  attempts: z.number().int().min(0).default(0),
  lastAttemptAt: z.number().int().optional(),
  status: QueueStatusEnum,
});

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Type for form queue items.
 * Derived from the Zod schema for runtime + compile-time safety.
 */
export type FormQueueItem = z.infer<typeof formQueueItemSchema>;

/**
 * Type for form types.
 */
export type FormType = z.infer<typeof FormTypeEnum>;

/**
 * Type for HTTP methods allowed in queue items.
 */
export type HttpMethod = z.infer<typeof HttpMethodEnum>;

/**
 * Type for queue item statuses.
 */
export type QueueStatus = z.infer<typeof QueueStatusEnum>;

// ============================================================================
// Idempotency Key Generation
// ============================================================================

/**
 * Generates a UUID v4 string.
 * Uses crypto.randomUUID when available, falls back to manual generation.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates an idempotency key for form submissions.
 *
 * Format: `{uuid-v4}-{timestamp-ms}-{form-type}`
 * Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890-1716000000000-animal`
 *
 * @param formType - The type of form being submitted
 * @returns A globally unique idempotency key
 * @throws Error if formType is invalid
 */
export function generateIdempotencyKey(formType: FormType): string {
  const parsed = FormTypeEnum.safeParse(formType);
  if (!parsed.success) {
    throw new Error(`Invalid form type: ${formType}`);
  }

  const uuid = generateUUID();
  const timestamp = Date.now();
  return `${uuid}-${timestamp}-${parsed.data}`;
}

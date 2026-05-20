// apps/web/src/shared/lib/offline/submit-form.ts
/**
 * submitFormWithOfflineSupport — handles form submission with offline queue support.
 *
 * When online: submits directly to API with idempotency key.
 * When offline: enqueues to IndexedDB queue for later sync.
 *
 * Usage:
 *   const result = await submitFormWithOfflineSupport({
 *     formType: 'animal',
 *     payload: formData,
 *     endpoint: '/api/v1/animales',
 *     predioId: 1,
 *     submitFn: (headers) => animalService.create(formData, headers),
 *   });
 */

import { generateIdempotencyKey } from './types';
import type { FormQueueItem, FormType, HttpMethod } from './types';
import { enqueue } from './form-queue';

export interface SubmitFormOptions<TResponse> {
  /** Form type for idempotency key generation */
  formType: FormType;
  /** Validated form data to submit or queue */
  payload: Record<string, unknown>;
  /** API endpoint path (e.g., '/api/v1/animales') */
  endpoint: string;
  /** HTTP method for the request (POST for create, PUT for update) */
  method?: HttpMethod;
  /** Expected version for optimistic locking (PUT requests) */
  expectedVersion?: number;
  /** Predio ID for tenant context */
  predioId: number;
  /** Function to call when online. Receives headers object. */
  submitFn: (headers: Record<string, string>) => Promise<TResponse>;
  /** Whether the browser is currently online */
  isOnline: boolean;
}

export interface SubmitFormResult<TResponse> {
  /** Whether the form was submitted directly or queued */
  mode: 'online' | 'offline';
  /** The idempotency key used (for tracking) */
  idempotencyKey: string;
  /** Response data (only for online mode) */
  data?: TResponse;
  /** Queue item (only for offline mode) */
  queueItem?: FormQueueItem;
}

/**
 * Submits a form with offline support.
 * Routes to API when online, queues when offline.
 */
export async function submitFormWithOfflineSupport<TResponse>(
  options: SubmitFormOptions<TResponse>,
): Promise<SubmitFormResult<TResponse>> {
  const { formType, payload, endpoint, predioId, submitFn, isOnline } = options;

  const idempotencyKey = generateIdempotencyKey(formType);

  if (isOnline) {
    // Submit directly to API with idempotency key
    const data = await submitFn({
      'X-Idempotency-Key': idempotencyKey,
    });

    return {
      mode: 'online',
      idempotencyKey,
      data,
    };
  }

  // Queue for offline submission
  const queueItem: FormQueueItem = {
    id: crypto.randomUUID(),
    formType,
    payload,
    idempotencyKey,
    endpoint,
    method: options.method ?? 'POST',
    expectedVersion: options.expectedVersion,
    predioId,
    createdAt: Date.now(),
    attempts: 0,
    status: 'pending',
  };

  await enqueue(queueItem);

  return {
    mode: 'offline',
    idempotencyKey,
    queueItem,
  };
}

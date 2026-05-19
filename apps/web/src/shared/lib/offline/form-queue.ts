// apps/web/src/shared/lib/offline/form-queue.ts
/**
 * Form Queue — IndexedDB-based queue for offline form submissions.
 *
 * Uses idb-keyval for consistent storage with the service worker.
 * Supports FIFO eviction when max size (50) is exceeded.
 *
 * Operations:
 * - enqueue: Add item to queue (evicts oldest if over limit)
 * - dequeue: Remove and return oldest item
 * - peek: Return oldest item without removing
 * - remove: Remove item by id
 * - flush: Clear all items
 * - getAll: Return all items
 * - getStatus: Return queue metadata (count, empty flag)
 */

import { get, set, del } from 'idb-keyval';
import { QUEUE_KEY, MAX_QUEUE_SIZE, formQueueItemSchema } from './types';
import type { FormQueueItem } from './types';

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Reads the current queue from IndexedDB.
 */
async function readQueue(): Promise<FormQueueItem[]> {
  const data = await get<FormQueueItem[]>(QUEUE_KEY);
  return data ?? [];
}

/**
 * Writes the queue to IndexedDB.
 */
async function writeQueue(items: FormQueueItem[]): Promise<void> {
  await set(QUEUE_KEY, items);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Adds a validated form item to the queue.
 * If the queue exceeds MAX_QUEUE_SIZE, the oldest item is removed (FIFO eviction).
 *
 * @param item - The form queue item to enqueue
 * @throws Error if the item fails schema validation
 */
export async function enqueue(item: FormQueueItem): Promise<void> {
  const parsed = formQueueItemSchema.safeParse(item);
  if (!parsed.success) {
    throw new Error(
      `Invalid form queue item: ${parsed.error.message}`,
    );
  }

  const queue = await readQueue();
  queue.push(parsed.data);

  // FIFO eviction: remove oldest items if over limit
  while (queue.length > MAX_QUEUE_SIZE) {
    queue.shift();
  }

  await writeQueue(queue);
}

/**
 * Removes and returns the oldest item from the queue.
 *
 * @returns The oldest item, or null if the queue is empty
 */
export async function dequeue(): Promise<FormQueueItem | null> {
  const queue = await readQueue();
  if (queue.length === 0) return null;

  const item = queue.shift()!;
  await writeQueue(queue);
  return item;
}

/**
 * Returns the oldest item without removing it.
 *
 * @returns The oldest item, or null if the queue is empty
 */
export async function peek(): Promise<FormQueueItem | null> {
  const queue = await readQueue();
  if (queue.length === 0) return null;
  return queue[0] ?? null;
}

/**
 * Removes an item from the queue by its id.
 *
 * @param id - The id of the item to remove
 */
export async function remove(id: string): Promise<void> {
  const queue = await readQueue();
  const filtered = queue.filter((item) => item.id !== id);
  await writeQueue(filtered);
}

/**
 * Clears all items from the queue.
 */
export async function flush(): Promise<void> {
  await del(QUEUE_KEY);
}

/**
 * Returns all items in the queue (oldest first).
 *
 * @returns Array of form queue items
 */
export async function getAll(): Promise<FormQueueItem[]> {
  return readQueue();
}

/**
 * Queue status metadata.
 */
export interface QueueStatus {
  count: number;
  isEmpty: boolean;
}

/**
 * Returns the current queue status.
 *
 * @returns Object with count and isEmpty flag
 */
export async function getStatus(): Promise<QueueStatus> {
  const queue = await readQueue();
  return {
    count: queue.length,
    isEmpty: queue.length === 0,
  };
}

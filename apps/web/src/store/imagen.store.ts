// apps/web/src/store/imagen.store.ts
/**
 * Imagen Store — Zustand store for upload queue state.
 *
 * Manages the lifecycle of file uploads:
 * - addFiles: creates UploadQueueItem[] from File[] with FileReader previews
 * - removeFile: removes a file from the queue and revokes its ObjectURL
 * - updateProgress: updates progress percentage for an in-progress upload
 * - markComplete: marks a file as successfully uploaded
 * - markError: marks a file as failed with an error message
 * - clearCompleted: removes all completed items from the queue
 * - clearAll: removes all items from the queue
 */

import { create } from 'zustand';
import type { UploadQueueItem } from '@/modules/imagenes/types/imagen.types';

interface ImagenStoreState {
  queue: UploadQueueItem[];
}

interface ImagenStoreActions {
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  markComplete: (id: string) => void;
  markError: (id: string, error: string) => void;
  setXhr: (id: string, xhr: XMLHttpRequest) => void;
  clearCompleted: () => void;
  clearAll: () => void;
}

type ImagenStore = ImagenStoreState & ImagenStoreActions;

export const useImagenStore = create<ImagenStore>((set, get) => ({
  queue: [],

  addFiles: async (files: File[]) => {
    const items: UploadQueueItem[] = [];

    for (const file of files) {
      const preview = await readFileAsDataURL(file);
      items.push({
        id: crypto.randomUUID(),
        file,
        preview,
        status: 'pending',
        progress: 0,
      });
    }

    set((state) => ({ queue: [...state.queue, ...items] }));
  },

  removeFile: (id: string) => {
    set((state) => {
      const item = state.queue.find((q) => q.id === id);
      // Abort XHR if upload is in progress
      if (item?.xhr) {
        item.xhr.abort();
      }
      // Revoke ObjectURL to free memory
      if (item?.preview && item.preview.startsWith('blob:')) {
        URL.revokeObjectURL(item.preview);
      }
      return { queue: state.queue.filter((q) => q.id !== id) };
    });
  },

  updateProgress: (id: string, progress: number) => {
    set((state) => ({
      queue: state.queue.map((q) =>
        q.id === id ? { ...q, progress, status: 'uploading' as const } : q
      ),
    }));
  },

  markComplete: (id: string) => {
    set((state) => ({
      queue: state.queue.map((q) =>
        q.id === id ? { ...q, progress: 100, status: 'complete' as const } : q
      ),
    }));
  },

  markError: (id: string, error: string) => {
    set((state) => ({
      queue: state.queue.map((q) =>
        q.id === id ? { ...q, status: 'error' as const, error } : q
      ),
    }));
  },

  setXhr: (id: string, xhr: XMLHttpRequest) => {
    set((state) => ({
      queue: state.queue.map((q) =>
        q.id === id ? { ...q, xhr } : q
      ),
    }));
  },

  clearCompleted: () => {
    set((state) => {
      // Revoke URLs for completed items
      state.queue
        .filter((q) => q.status === 'complete')
        .forEach((q) => {
          if (q.preview && q.preview.startsWith('blob:')) {
            URL.revokeObjectURL(q.preview);
          }
        });
      return { queue: state.queue.filter((q) => q.status !== 'complete') };
    });
  },

  clearAll: () => {
    // Revoke all URLs
    get().queue.forEach((q) => {
      if (q.preview && q.preview.startsWith('blob:')) {
        URL.revokeObjectURL(q.preview);
      }
      if (q.xhr) {
        q.xhr.abort();
      }
    });
    set({ queue: [] });
  },
}));

// ============================================================================
// Helpers
// ============================================================================

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { FeedbackItem, FeedbackStatus } from '@/types';
import { feedbackItems as initialMockItems } from '@/data/mockData';

const STORAGE_KEY = 'loop_feedback_items_v1';
const EVENT_KEY = 'loop-feedback-storage-change';
const AUTO_ARCHIVE_DAYS = 7;

// Module-level cache shared by every hook instance. All mutations read from and
// write to this single copy, so two components can never clobber each other's writes.
let cache: FeedbackItem[] | null = null;

/* eslint-disable @typescript-eslint/no-explicit-any */
function reviveItem(item: any): FeedbackItem {
  return {
    ...item,
    description: item.description || item.rawText || item.translatedText || 'No description provided.',
    translatedDescription: item.translatedDescription || item.translatedText,
    isTechnical: item.isTechnical !== undefined ? item.isTechnical : Boolean(item.translatedDescription || item.translatedText),
    isDuplicate: item.isDuplicate || false,
    createdAt: new Date(item.createdAt),
    lastUpdated: new Date(item.lastUpdated),
    resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Items resolved more than AUTO_ARCHIVE_DAYS ago move to Archived automatically. */
function applyAutoArchive(items: FeedbackItem[]): { items: FeedbackItem[]; changed: boolean } {
  const now = Date.now();
  let changed = false;
  const result = items.map((item) => {
    if (item.status === 'resolved' && item.resolvedAt) {
      const daysResolved = (now - item.resolvedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysResolved >= AUTO_ARCHIVE_DAYS) {
        changed = true;
        return { ...item, status: 'archived' as FeedbackStatus };
      }
    }
    return item;
  });
  return { items: result, changed };
}

function persist(items: FeedbackItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving feedback items to storage:', err);
  }
}

function readStore(): FeedbackItem[] {
  if (cache) return cache;
  let items: FeedbackItem[];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    items = stored ? (JSON.parse(stored) as unknown[]).map(reviveItem) : initialMockItems;
  } catch (err) {
    console.error('Error loading feedback items from storage:', err);
    items = initialMockItems;
  }
  const archived = applyAutoArchive(items);
  cache = archived.items;
  if (archived.changed || !localStorage.getItem(STORAGE_KEY)) {
    persist(cache);
  }
  return cache;
}

function writeStore(items: FeedbackItem[]) {
  cache = items;
  persist(items);
  window.dispatchEvent(new CustomEvent(EVENT_KEY));
}

const EMPTY_ITEMS: FeedbackItem[] = [];

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_KEY, callback);
  return () => window.removeEventListener(EVENT_KEY, callback);
}

export function useFeedback() {
  const items = useSyncExternalStore(subscribe, readStore, () => EMPTY_ITEMS);
  const isLoaded = items !== EMPTY_ITEMS;

  const addItem = useCallback(
    (newItemData: Omit<FeedbackItem, 'id' | 'createdAt' | 'lastUpdated' | 'resolvedAt'>) => {
      const newItem: FeedbackItem = {
        ...newItemData,
        id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date(),
        lastUpdated: new Date(),
        resolvedAt: newItemData.status === 'resolved' ? new Date() : undefined,
      };
      writeStore([newItem, ...readStore()]);
      return newItem;
    },
    []
  );

  const updateStatus = useCallback((id: string, newStatus: FeedbackStatus) => {
    writeStore(
      readStore().map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              lastUpdated: new Date(),
              resolvedAt: newStatus === 'resolved' ? new Date() : item.resolvedAt,
            }
          : item
      )
    );
  }, []);

  const updateItem = useCallback((id: string, changes: Partial<FeedbackItem>) => {
    writeStore(
      readStore().map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
              lastUpdated: new Date(),
              resolvedAt:
                changes.status === 'resolved' && item.status !== 'resolved'
                  ? new Date()
                  : item.resolvedAt,
            }
          : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    writeStore(readStore().filter((item) => item.id !== id));
  }, []);

  const resetToDefault = useCallback(() => {
    writeStore(initialMockItems);
  }, []);

  return {
    items,
    isLoaded,
    addItem,
    updateStatus,
    updateItem,
    deleteItem,
    resetToDefault,
  };
}

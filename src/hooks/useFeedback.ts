'use client';

import { useState, useEffect, useCallback } from 'react';
import { FeedbackItem, FeedbackStatus } from '@/types';
import { feedbackItems as initialMockItems } from '@/data/mockData';

const STORAGE_KEY = 'loop_feedback_items_v1';
const EVENT_KEY = 'loop-feedback-storage-change';

export function useFeedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage or fallback to initial mock data
  const loadItems = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: any[] = JSON.parse(stored);
        // Revive date objects and fallback descriptions
        const revived: FeedbackItem[] = parsed.map((item) => ({
          ...item,
          description: item.description || item.rawText || item.translatedText || 'No description provided.',
          translatedDescription: item.translatedDescription || item.translatedText,
          isTechnical: item.isTechnical !== undefined ? item.isTechnical : Boolean(item.translatedDescription || item.translatedText),
          isDuplicate: item.isDuplicate || false,
          createdAt: new Date(item.createdAt),
          lastUpdated: new Date(item.lastUpdated),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined,
        }));
        setItems(revived);
      } else {
        setItems(initialMockItems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockItems));
      }
    } catch (err) {
      console.error('Error loading feedback items from storage:', err);
      setItems(initialMockItems);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadItems();

    // Listen for changes from other components/modals
    const handleStorageChange = () => loadItems();
    window.addEventListener(EVENT_KEY, handleStorageChange);
    return () => window.removeEventListener(EVENT_KEY, handleStorageChange);
  }, [loadItems]);

  // Save to storage and dispatch sync event
  const saveAndNotify = useCallback((newItems: FeedbackItem[]) => {
    setItems(newItems);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        window.dispatchEvent(new CustomEvent(EVENT_KEY));
      } catch (err) {
        console.error('Error saving feedback items to storage:', err);
      }
    }
  }, []);

  // Add new item
  const addItem = useCallback(
    (newItemData: any) => {
      const newItem: FeedbackItem = {
        ...newItemData,
        description: newItemData.description || newItemData.rawText || 'No description provided.',
        translatedDescription: newItemData.translatedDescription || newItemData.translatedText || undefined,
        isTechnical: newItemData.isTechnical !== undefined ? newItemData.isTechnical : Boolean(newItemData.translatedDescription || newItemData.translatedText),
        isDuplicate: newItemData.isDuplicate || false,
        id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date(),
        lastUpdated: new Date(),
        duplicates: 0,
        resolvedAt: newItemData.status === 'resolved' ? new Date() : undefined,
      };

      const updated = [newItem, ...items];
      saveAndNotify(updated);
      return newItem;
    },
    [items, saveAndNotify]
  );

  // Update item status
  const updateStatus = useCallback(
    (id: string, newStatus: FeedbackStatus) => {
      const updated = items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            lastUpdated: new Date(),
            resolvedAt: newStatus === 'resolved' ? new Date() : item.resolvedAt,
          };
        }
        return item;
      });
      saveAndNotify(updated);
    },
    [items, saveAndNotify]
  );

  // Reset to default mock data (useful for testing/demo)
  const resetToDefault = useCallback(() => {
    saveAndNotify(initialMockItems);
  }, [saveAndNotify]);

  return {
    items,
    isLoaded,
    addItem,
    updateStatus,
    resetToDefault,
  };
}

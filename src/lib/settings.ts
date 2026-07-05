'use client';

import { useSyncExternalStore } from 'react';

export interface LoopSettings {
  digestTime: string;
  staleThresholdDays: number;
  autoReply: boolean;
  slackChannel: string;
}

const STORAGE_KEY = 'loop_settings_v1';
export const SETTINGS_EVENT = 'loop-settings-change';

export const defaultSettings: LoopSettings = {
  digestTime: '09:00',
  staleThresholdDays: 5,
  autoReply: true,
  slackChannel: '#design-feedback',
};

// Cached so useSyncExternalStore gets a stable snapshot reference between saves
let settingsCache: LoopSettings | null = null;

export function getSettings(): LoopSettings {
  if (typeof window === 'undefined') return defaultSettings;
  if (settingsCache) return settingsCache;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    settingsCache = stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch (err) {
    console.error('Error loading settings:', err);
    settingsCache = defaultSettings;
  }
  return settingsCache!;
}

export function saveSettings(settings: LoopSettings) {
  try {
    settingsCache = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(SETTINGS_EVENT, callback);
  return () => window.removeEventListener(SETTINGS_EVENT, callback);
}

/** Reactive settings — re-renders when settings are saved anywhere in the app. */
export function useSettings(): LoopSettings {
  return useSyncExternalStore(subscribe, getSettings, () => defaultSettings);
}

import type { AppState } from '../types';

const STORAGE_KEY = 'running_list_data';
const STORAGE_VERSION = 1;

interface StorageData {
  version: number;
  data: AppState;
}

const defaultState: AppState = {
  tasks: [],
  shutdownNote: '',
  pinHash: null,
};

export const loadData = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as StorageData;
    
    // Migration logic would go here if version < STORAGE_VERSION
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, migrating...');
      // e.g. if (parsed.version === 1) { ... }
    }
    
    return parsed.data || defaultState;
  } catch (error) {
    console.error('Failed to load local data, returning default state.', error);
    return defaultState;
  }
};

export const saveData = (data: AppState): void => {
  try {
    const storageData: StorageData = {
      version: STORAGE_VERSION,
      data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save local data.', error);
  }
};

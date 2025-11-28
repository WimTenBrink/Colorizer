import { QueueItem } from '../types';

const DB_NAME = 'katje_colorizer_db';
const STORE_NAME = 'queue_store';
const DB_VERSION = 1;

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const loadQueue = async (): Promise<QueueItem[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result || [];
        // Recreate blob URLs which are not persisted
        const queue = items.map((item: any) => ({
          ...item,
          previewUrl: URL.createObjectURL(item.file)
        }));
        resolve(queue);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading queue from storage:', error);
    return [];
  }
};

export const syncQueue = async (queue: QueueItem[]) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Get all existing keys to handle deletions
    const keysRequest = store.getAllKeys();
    
    keysRequest.onsuccess = () => {
      const existingKeys = new Set(keysRequest.result as string[]);
      const currentKeys = new Set(queue.map(i => i.id));
      
      // Delete removed items
      existingKeys.forEach(key => {
        if (!currentKeys.has(key)) {
          store.delete(key);
        }
      });
      
      // Put current items (Update/Insert)
      queue.forEach(item => {
        // Create a clean object for storage, removing the previewUrl
        // IDB handles File objects natively
        const { previewUrl, ...storedItem } = item;
        store.put(storedItem);
      });
    };
    
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Error syncing queue to storage:', error);
  }
};

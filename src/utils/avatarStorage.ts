// IndexedDB persistent storage for .VRM 3D Avatar files and avatars metadata
// Allows avatars up to 100MB+ to persist across browser sessions without LocalStorage quota issues

const DB_NAME = 'ShowrunnerStudioDB';
const STORE_NAME = 'avatar_files';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB non supporté'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredAvatar {
  id: string;
  name: string;
  size: number;
  lastModified: number;
  blob: Blob;
}

export async function saveVrmFileToStorage(file: File): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredAvatar = {
      id: 'current_avatar',
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      blob: file,
    };

    await new Promise<void>((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erreur sauvegarde VRM dans IndexedDB:', err);
  }
}

export async function getStoredVrmFile(): Promise<File | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredAvatar | undefined = await new Promise((resolve, reject) => {
      const req = store.get('current_avatar');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (!record || !record.blob) return null;

    return new File([record.blob], record.name, {
      type: 'application/octet-stream',
      lastModified: record.lastModified,
    });
  } catch (err) {
    console.warn('Erreur lecture VRM depuis IndexedDB:', err);
    return null;
  }
}

export async function removeStoredVrmFile(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const req = store.delete('current_avatar');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erreur suppression VRM:', err);
  }
}

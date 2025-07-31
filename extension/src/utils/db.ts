import { openDB } from 'idb';
export async function storeSound(id: string, blob: Blob) {
  const db = await openDB('SoundCacheDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sounds')) {
      db.createObjectStore('sounds');
  }
    },
  });
  const existing = await db.get('sounds', id);
  if (!existing) {
    console.log("Storing sound in IndexedDB:", id);
    await db.put('sounds', blob, id);
  } else {
    console.log("Sound already cached:", id);
  }
}

export async function retrieveSound(id: number): Promise<Blob> {
  const db = await openDB('SoundCacheDB', 1);
  const blob = await db.get('sounds', id);
  return blob;
}

export async function isSoundCached(id: string): Promise<boolean> {
  const db = await openDB('SoundCacheDB', 1);
  const sound = await db.get('sounds', id);
  return !!sound;
}

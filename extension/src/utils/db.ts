import { openDB } from 'idb';
export async function storeSound(id: string, blob: Blob) {
  console.log("Storing sound in IndexedDB:", id);
  const db = await openDB('SoundCacheDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sounds')) {
      db.createObjectStore('sounds');
  }
    },
  });
  await db.put('sounds', blob, id);
}

export async function retrieveSound(id: number): Promise<Blob> {
  const db = await openDB('SoundCacheDB', 1);
  const blob = await db.get('sounds', id);
  return blob;
}
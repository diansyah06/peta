import { openDB } from 'idb';

// === Konstanta Database ===
const DATABASE_NAME = 'citycare-db';
const DATABASE_VERSION = 1;
const FAVORITES_STORE = 'favorites'; // Ganti nama store
const OUTBOX_STORE = 'outbox';

// === Inisialisasi Database ===
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
      // Buat store untuk favorit
      const favoritesStore = db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
      favoritesStore.createIndex('id', 'id', { unique: true });
    }

    if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
      const outboxStore = db.createObjectStore(OUTBOX_STORE, { keyPath: 'id' });
      outboxStore.createIndex('id', 'id', { unique: true });
    }
  },
});

// === Fungsi: Tambah Favorit ===
export const addFavorite = async (story) => {
  const db = await dbPromise;
  await db.put(FAVORITES_STORE, story);
  return story.id;
};

// === Fungsi: Ambil Semua Favorit ===
export const getAllFavorites = async () => {
  const db = await dbPromise;
  return db.getAll(FAVORITES_STORE);
};

// === Fungsi: Ambil Satu Favorit by ID ===
export const getFavorite = async (id) => {
  const db = await dbPromise;
  return db.get(FAVORITES_STORE, id);
};

// === Fungsi: Hapus Favorit ===
export const deleteFavorite = async (id) => {
  const db = await dbPromise;
  await db.delete(FAVORITES_STORE, id);
  return id;
};

// ... (SEMUA FUNGSI OUTBOX DI BAWAH INI TETAP SAMA, JANGAN DIHAPUS) ...
// === Fungsi: Outbox (untuk laporan offline) ===
export const addToOutbox = async (report) => {
  // ... (kode outbox tetap sama)
};

export const getOutbox = async () => {
  // ... (kode outbox tetap sama)
};

export const clearOutboxItem = async (id) => {
  // ... (kode outbox tetap sama)
};

// === Sinkronisasi Offline -> Online ===
export const syncOfflineReports = async () => {
  // ... (kode outbox tetap sama)
};
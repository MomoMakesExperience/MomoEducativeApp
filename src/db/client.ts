import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { migrateDbIfNeeded } from './schema';

let dbPromise: Promise<SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync('momo.db').then(async (db) => {
      await migrateDbIfNeeded(db);
      return db;
    });
  }
  return dbPromise;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

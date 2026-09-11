import { type SQLiteDatabase } from 'expo-sqlite';

// Bump this and add a branch below whenever the schema changes.
export const DB_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DB_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        prenom TEXT NOT NULL DEFAULT '',
        universite TEXT NOT NULL DEFAULT '',
        niveau TEXT NOT NULL DEFAULT 'L1',
        avatar_uri TEXT,
        accent_color TEXT NOT NULL DEFAULT '#1E90FF',
        theme_mode TEXT NOT NULL DEFAULT 'system',
        onboarded INTEGER NOT NULL DEFAULT 0,
        notifications_enabled INTEGER NOT NULL DEFAULT 1
      );

      INSERT OR IGNORE INTO user_profile (id) VALUES (1);

      CREATE TABLE IF NOT EXISTS ue (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        credits INTEGER NOT NULL DEFAULT 0,
        couleur TEXT NOT NULL DEFAULT '#1E90FF',
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS matiere (
        id TEXT PRIMARY KEY,
        ue_id TEXT REFERENCES ue(id) ON DELETE SET NULL,
        nom TEXT NOT NULL,
        code_ue TEXT NOT NULL DEFAULT '',
        coefficient REAL NOT NULL DEFAULT 1,
        credits INTEGER NOT NULL DEFAULT 0,
        couleur TEXT NOT NULL DEFAULT '#1E90FF',
        icone TEXT NOT NULL DEFAULT 'book',
        heures_totales REAL NOT NULL DEFAULT 0,
        heures_restantes REAL NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS examen (
        id TEXT PRIMARY KEY,
        matiere_id TEXT REFERENCES matiere(id) ON DELETE CASCADE,
        titre TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'exam',
        date_iso TEXT NOT NULL,
        heure TEXT,
        couleur TEXT NOT NULL DEFAULT '#1E90FF',
        icone TEXT NOT NULL DEFAULT 'award',
        alerte TEXT NOT NULL DEFAULT 'default',
        note REAL,
        statut TEXT NOT NULL DEFAULT 'upcoming',
        notification_id TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cours_edt (
        id TEXT PRIMARY KEY,
        matiere_id TEXT REFERENCES matiere(id) ON DELETE SET NULL,
        jour TEXT NOT NULL,
        heure_debut TEXT NOT NULL,
        duree_minutes INTEGER NOT NULL DEFAULT 60,
        titre TEXT NOT NULL,
        salle TEXT NOT NULL DEFAULT '',
        couleur TEXT NOT NULL DEFAULT '#1E90FF',
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS focus_session (
        id TEXT PRIMARY KEY,
        matiere_id TEXT REFERENCES matiere(id) ON DELETE SET NULL,
        date_iso TEXT NOT NULL,
        duree_secondes INTEGER NOT NULL,
        completee INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tache (
        id TEXT PRIMARY KEY,
        matiere_id TEXT REFERENCES matiere(id) ON DELETE SET NULL,
        titre TEXT NOT NULL,
        date_iso TEXT NOT NULL,
        fait INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
    `);
    currentVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
}

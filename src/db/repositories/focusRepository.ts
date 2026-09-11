import { getDb, newId } from '../client';
import type { FocusSession } from '../types';

interface SessionRow {
  id: string;
  matiere_id: string | null;
  date_iso: string;
  duree_secondes: number;
  completee: number;
}

function fromRow(row: SessionRow): FocusSession {
  return {
    id: row.id,
    matiereId: row.matiere_id,
    dateIso: row.date_iso,
    dureeSecondes: row.duree_secondes,
    completee: !!row.completee,
  };
}

export async function listSessions(): Promise<FocusSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<SessionRow>(
    'SELECT * FROM focus_session ORDER BY date_iso DESC'
  );
  return rows.map(fromRow);
}

export async function createSession(
  matiereId: string | null,
  dureeSecondes: number,
  completee: boolean
): Promise<FocusSession> {
  const db = await getDb();
  const id = newId();
  const dateIso = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO focus_session (id, matiere_id, date_iso, duree_secondes, completee, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, matiereId, dateIso, dureeSecondes, completee ? 1 : 0, Date.now()]
  );
  const row = await db.getFirstAsync<SessionRow>('SELECT * FROM focus_session WHERE id = ?', [id]);
  return fromRow(row!);
}

export async function countSessionsToday(): Promise<number> {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) as n FROM focus_session WHERE completee = 1 AND date_iso LIKE ?`,
    [`${today}%`]
  );
  return row?.n ?? 0;
}

export async function computeStreakDays(): Promise<number> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ day: string }>(
    `SELECT DISTINCT substr(date_iso, 1, 10) as day FROM focus_session WHERE completee = 1 ORDER BY day DESC`
  );
  if (rows.length === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const dayStr = cursor.toISOString().slice(0, 10);
    if (rows.some((r) => r.day === dayStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    } else {
      break;
    }
  }
  return streak;
}

import { getDb, newId } from '../client';
import type { Tache } from '../types';

interface TacheRow {
  id: string;
  matiere_id: string | null;
  titre: string;
  date_iso: string;
  fait: number;
}

function fromRow(row: TacheRow): Tache {
  return {
    id: row.id,
    matiereId: row.matiere_id,
    titre: row.titre,
    dateIso: row.date_iso,
    fait: !!row.fait,
  };
}

export async function listTachesForDate(dateIso: string): Promise<Tache[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TacheRow>(
    'SELECT * FROM tache WHERE date_iso = ? ORDER BY created_at ASC',
    [dateIso]
  );
  return rows.map(fromRow);
}

export async function createTache(
  titre: string,
  dateIso: string,
  matiereId: string | null
): Promise<Tache> {
  const db = await getDb();
  const id = newId();
  await db.runAsync(
    `INSERT INTO tache (id, matiere_id, titre, date_iso, fait, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
    [id, matiereId, titre, dateIso, Date.now()]
  );
  const row = await db.getFirstAsync<TacheRow>('SELECT * FROM tache WHERE id = ?', [id]);
  return fromRow(row!);
}

export async function toggleTache(id: string, fait: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE tache SET fait = ? WHERE id = ?', [fait ? 1 : 0, id]);
}

export async function deleteTache(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tache WHERE id = ?', [id]);
}

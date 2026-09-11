import { getDb, newId } from '../client';
import type { UE } from '../types';

interface UeRow {
  id: string;
  nom: string;
  credits: number;
  couleur: string;
}

function fromRow(row: UeRow): UE {
  return { id: row.id, nom: row.nom, credits: row.credits, couleur: row.couleur };
}

export async function listUes(): Promise<UE[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<UeRow>('SELECT * FROM ue ORDER BY created_at ASC');
  return rows.map(fromRow);
}

export async function createUe(nom: string, credits: number, couleur: string): Promise<UE> {
  const db = await getDb();
  const id = newId();
  await db.runAsync(
    'INSERT INTO ue (id, nom, credits, couleur, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, nom, credits, couleur, Date.now()]
  );
  const row = await db.getFirstAsync<UeRow>('SELECT * FROM ue WHERE id = ?', [id]);
  return fromRow(row!);
}

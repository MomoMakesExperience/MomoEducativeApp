import { getDb, newId } from '../client';
import type { AlerteOption, Examen, ExamenStatut, ExamenType, IconName } from '../types';

interface ExamenRow {
  id: string;
  matiere_id: string | null;
  titre: string;
  type: string;
  date_iso: string;
  heure: string | null;
  couleur: string;
  icone: string;
  alerte: string;
  note: number | null;
  statut: string;
  notification_id: string | null;
}

function fromRow(row: ExamenRow): Examen {
  return {
    id: row.id,
    matiereId: row.matiere_id,
    titre: row.titre,
    type: row.type as ExamenType,
    dateIso: row.date_iso,
    heure: row.heure,
    couleur: row.couleur,
    icone: row.icone as IconName,
    alerte: row.alerte as AlerteOption,
    note: row.note,
    statut: row.statut as ExamenStatut,
    notificationId: row.notification_id,
  };
}

export async function listExamens(): Promise<Examen[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ExamenRow>(
    'SELECT * FROM examen ORDER BY date_iso ASC'
  );
  return rows.map(fromRow);
}

export interface CreateExamenInput {
  titre: string;
  type: ExamenType;
  dateIso: string;
  heure: string | null;
  couleur: string;
  icone: IconName;
  alerte: AlerteOption;
  matiereId?: string | null;
  statut?: ExamenStatut;
  note?: number | null;
}

export async function createExamen(input: CreateExamenInput): Promise<Examen> {
  const db = await getDb();
  const id = newId();
  await db.runAsync(
    `INSERT INTO examen (id, matiere_id, titre, type, date_iso, heure, couleur, icone, alerte, note, statut, notification_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.matiereId ?? null,
      input.titre,
      input.type,
      input.dateIso,
      input.heure,
      input.couleur,
      input.icone,
      input.alerte,
      input.note ?? null,
      input.statut ?? 'upcoming',
      null,
      Date.now(),
    ]
  );
  const row = await db.getFirstAsync<ExamenRow>('SELECT * FROM examen WHERE id = ?', [id]);
  return fromRow(row!);
}

export async function setExamenNotificationId(id: string, notificationId: string | null) {
  const db = await getDb();
  await db.runAsync('UPDATE examen SET notification_id = ? WHERE id = ?', [notificationId, id]);
}

export async function setExamenNote(id: string, note: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE examen SET note = ?, statut = ? WHERE id = ?', [note, 'done', id]);
}

export async function markExamenDone(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE examen SET statut = ? WHERE id = ?', ['done', id]);
}

export async function deleteExamen(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM examen WHERE id = ?', [id]);
}

export async function refreshPastExamens(): Promise<void> {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);
  await db.runAsync(
    `UPDATE examen SET statut = 'done' WHERE statut = 'upcoming' AND date_iso < ?`,
    [today]
  );
}

import { getDb, newId } from '../client';
import type { CoursEdt } from '../types';

interface CoursRow {
  id: string;
  matiere_id: string | null;
  jour: string;
  heure_debut: string;
  duree_minutes: number;
  titre: string;
  salle: string;
  couleur: string;
}

function fromRow(row: CoursRow): CoursEdt {
  return {
    id: row.id,
    matiereId: row.matiere_id,
    jour: row.jour,
    heureDebut: row.heure_debut,
    dureeMinutes: row.duree_minutes,
    titre: row.titre,
    salle: row.salle,
    couleur: row.couleur,
  };
}

export async function listCours(): Promise<CoursEdt[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<CoursRow>(
    'SELECT * FROM cours_edt ORDER BY heure_debut ASC'
  );
  return rows.map(fromRow);
}

export interface CreateCoursInput {
  jour: string;
  heureDebut: string;
  dureeMinutes: number;
  titre: string;
  salle: string;
  couleur: string;
  matiereId?: string | null;
}

export async function createCours(input: CreateCoursInput): Promise<CoursEdt> {
  const db = await getDb();
  const id = newId();
  await db.runAsync(
    `INSERT INTO cours_edt (id, matiere_id, jour, heure_debut, duree_minutes, titre, salle, couleur, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.matiereId ?? null,
      input.jour,
      input.heureDebut,
      input.dureeMinutes,
      input.titre,
      input.salle,
      input.couleur,
      Date.now(),
    ]
  );
  const row = await db.getFirstAsync<CoursRow>('SELECT * FROM cours_edt WHERE id = ?', [id]);
  return fromRow(row!);
}

export async function deleteCours(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM cours_edt WHERE id = ?', [id]);
}

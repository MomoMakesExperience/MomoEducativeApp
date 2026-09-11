import { getDb, newId } from '../client';
import type { IconName, Matiere } from '../types';

interface MatiereRow {
  id: string;
  ue_id: string | null;
  nom: string;
  code_ue: string;
  coefficient: number;
  credits: number;
  couleur: string;
  icone: string;
  heures_totales: number;
  heures_restantes: number;
}

function fromRow(row: MatiereRow): Matiere {
  return {
    id: row.id,
    ueId: row.ue_id,
    nom: row.nom,
    codeUe: row.code_ue,
    coefficient: row.coefficient,
    credits: row.credits,
    couleur: row.couleur,
    icone: row.icone as IconName,
    heuresTotales: row.heures_totales,
    heuresRestantes: row.heures_restantes,
  };
}

export async function listMatieres(): Promise<Matiere[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MatiereRow>(
    'SELECT * FROM matiere ORDER BY created_at ASC'
  );
  return rows.map(fromRow);
}

export interface CreateMatiereInput {
  nom: string;
  codeUe: string;
  coefficient: number;
  credits: number;
  couleur: string;
  icone: IconName;
  heuresTotales: number;
  ueId?: string | null;
}

export async function createMatiere(input: CreateMatiereInput): Promise<Matiere> {
  const db = await getDb();
  const id = newId();
  await db.runAsync(
    `INSERT INTO matiere (id, ue_id, nom, code_ue, coefficient, credits, couleur, icone, heures_totales, heures_restantes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.ueId ?? null,
      input.nom,
      input.codeUe,
      input.coefficient,
      input.credits,
      input.couleur,
      input.icone,
      input.heuresTotales,
      input.heuresTotales,
      Date.now(),
    ]
  );
  const row = await db.getFirstAsync<MatiereRow>('SELECT * FROM matiere WHERE id = ?', [id]);
  return fromRow(row!);
}

export async function decrementHeuresRestantes(matiereId: string, hours: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE matiere SET heures_restantes = MAX(0, heures_restantes - ?) WHERE id = ?',
    [hours, matiereId]
  );
}

export async function deleteMatiere(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM matiere WHERE id = ?', [id]);
}

import type { Examen, Matiere, UE } from '@/db/types';

export interface MatiereBreakdown {
  matiere: Matiere;
  note: number | null;
}

export interface UeBreakdown {
  ue: UE;
  matieres: MatiereBreakdown[];
  moyenne: number | null;
}

export interface BulletinResult {
  ues: UeBreakdown[];
  matieresSansUe: MatiereBreakdown[];
  moyenneGenerale: number | null;
  ueCount: number;
  totalCredits: number;
}

function matiereNote(matiere: Matiere, examens: Examen[]): number | null {
  const notes = examens
    .filter((e) => e.matiereId === matiere.id && e.note !== null)
    .map((e) => e.note as number);
  if (notes.length === 0) return null;
  return notes.reduce((a, b) => a + b, 0) / notes.length;
}

function weightedAverage(entries: { note: number | null; coeff: number }[]): number | null {
  const graded = entries.filter((e) => e.note !== null) as { note: number; coeff: number }[];
  if (graded.length === 0) return null;
  const sumWeighted = graded.reduce((acc, e) => acc + e.note * e.coeff, 0);
  const sumCoeff = graded.reduce((acc, e) => acc + e.coeff, 0);
  if (sumCoeff === 0) return null;
  return sumWeighted / sumCoeff;
}

export function computeBulletin(ues: UE[], matieres: Matiere[], examens: Examen[]): BulletinResult {
  const ueBreakdowns: UeBreakdown[] = ues.map((ue) => {
    const ueMatieres = matieres.filter((m) => m.ueId === ue.id);
    const breakdowns: MatiereBreakdown[] = ueMatieres.map((m) => ({
      matiere: m,
      note: matiereNote(m, examens),
    }));
    const moyenne = weightedAverage(
      breakdowns.map((b) => ({ note: b.note, coeff: b.matiere.coefficient }))
    );
    return { ue, matieres: breakdowns, moyenne };
  });

  const matieresSansUe: MatiereBreakdown[] = matieres
    .filter((m) => !m.ueId)
    .map((m) => ({ matiere: m, note: matiereNote(m, examens) }));

  const allEntries = [
    ...ueBreakdowns.flatMap((u) => u.matieres),
    ...matieresSansUe,
  ].map((b) => ({ note: b.note, coeff: b.matiere.coefficient }));

  const moyenneGenerale = weightedAverage(allEntries);
  const totalCredits = ues.reduce((acc, ue) => acc + ue.credits, 0);

  return {
    ues: ueBreakdowns,
    matieresSansUe,
    moyenneGenerale,
    ueCount: ues.length,
    totalCredits,
  };
}

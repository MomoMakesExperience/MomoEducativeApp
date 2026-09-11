export type ThemeMode = 'system' | 'light' | 'dark';
export type ExamenType = 'exam' | 'devoir' | 'projet';
export type ExamenStatut = 'upcoming' | 'done';
export type AlerteOption = 'aucune' | 'default' | 'veille' | 'jour_j';
export type IconName = 'award' | 'book' | 'calculator' | 'code' | 'globe' | 'flask';

export interface UserProfile {
  id: 1;
  prenom: string;
  universite: string;
  niveau: string;
  avatarUri: string | null;
  accentColor: string;
  themeMode: ThemeMode;
  onboarded: boolean;
  notificationsEnabled: boolean;
}

export interface UE {
  id: string;
  nom: string;
  credits: number;
  couleur: string;
}

export interface Matiere {
  id: string;
  ueId: string | null;
  nom: string;
  codeUe: string;
  coefficient: number;
  credits: number;
  couleur: string;
  icone: IconName;
  heuresTotales: number;
  heuresRestantes: number;
}

export interface Examen {
  id: string;
  matiereId: string | null;
  titre: string;
  type: ExamenType;
  dateIso: string;
  heure: string | null;
  couleur: string;
  icone: IconName;
  alerte: AlerteOption;
  note: number | null;
  statut: ExamenStatut;
  notificationId: string | null;
}

export interface CoursEdt {
  id: string;
  matiereId: string | null;
  jour: string;
  heureDebut: string;
  dureeMinutes: number;
  titre: string;
  salle: string;
  couleur: string;
}

export interface FocusSession {
  id: string;
  matiereId: string | null;
  dateIso: string;
  dureeSecondes: number;
  completee: boolean;
}

export interface Tache {
  id: string;
  matiereId: string | null;
  titre: string;
  dateIso: string;
  fait: boolean;
}

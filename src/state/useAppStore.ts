import { create } from 'zustand';
import type {
  AlerteOption,
  CoursEdt,
  Examen,
  ExamenType,
  FocusSession,
  IconName,
  Matiere,
  Tache,
  ThemeMode,
  UE,
  UserProfile,
} from '@/db/types';
import * as profileRepo from '@/db/repositories/profileRepository';
import * as matiereRepo from '@/db/repositories/matiereRepository';
import * as examenRepo from '@/db/repositories/examenRepository';
import * as ueRepo from '@/db/repositories/ueRepository';
import * as edtRepo from '@/db/repositories/edtRepository';
import * as focusRepo from '@/db/repositories/focusRepository';
import * as tacheRepo from '@/db/repositories/tacheRepository';
import { scheduleExamenReminder, cancelReminder } from '@/lib/notifications';
import { todayIso } from '@/lib/date';

interface AppState {
  ready: boolean;
  profile: UserProfile | null;
  matieres: Matiere[];
  examens: Examen[];
  ues: UE[];
  cours: CoursEdt[];
  sessionsToday: number;
  streakDays: number;
  taches: Tache[];
  tachesDate: string;

  init: () => Promise<void>;
  refreshAll: () => Promise<void>;

  completeOnboarding: (data: { prenom: string; universite: string; niveau: string }) => Promise<void>;
  setAccentColor: (color: string) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setAvatarUri: (uri: string | null) => Promise<void>;

  addMatiere: (input: {
    nom: string;
    codeUe: string;
    coefficient: number;
    credits: number;
    couleur: string;
    icone: IconName;
    heuresTotales: number;
  }) => Promise<void>;

  addExamen: (input: {
    titre: string;
    type: ExamenType;
    dateIso: string;
    heure: string | null;
    couleur: string;
    icone: IconName;
    alerte: AlerteOption;
    matiereId?: string | null;
  }) => Promise<void>;
  setExamenNote: (id: string, note: number) => Promise<void>;
  markExamenDone: (id: string) => Promise<void>;
  removeExamen: (id: string) => Promise<void>;

  addUe: (nom: string, credits: number, couleur: string) => Promise<void>;

  addCours: (input: {
    jour: string;
    heureDebut: string;
    dureeMinutes: number;
    titre: string;
    salle: string;
    couleur: string;
    matiereId?: string | null;
  }) => Promise<void>;

  loadTachesForDate: (dateIso: string) => Promise<void>;
  addTache: (titre: string, dateIso: string, matiereId: string | null) => Promise<void>;
  toggleTache: (id: string, fait: boolean) => Promise<void>;

  recordFocusSession: (matiereId: string | null, dureeSecondes: number, completee: boolean) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  profile: null,
  matieres: [],
  examens: [],
  ues: [],
  cours: [],
  sessionsToday: 0,
  streakDays: 0,
  taches: [],
  tachesDate: todayIso(),

  init: async () => {
    if (get().ready) return;
    await examenRepo.refreshPastExamens();
    await get().refreshAll();
    set({ ready: true });
  },

  refreshAll: async () => {
    const [profile, matieres, examens, ues, cours, sessionsToday, streakDays, taches] =
      await Promise.all([
        profileRepo.getProfile(),
        matiereRepo.listMatieres(),
        examenRepo.listExamens(),
        ueRepo.listUes(),
        edtRepo.listCours(),
        focusRepo.countSessionsToday(),
        focusRepo.computeStreakDays(),
        tacheRepo.listTachesForDate(get().tachesDate),
      ]);
    set({ profile, matieres, examens, ues, cours, sessionsToday, streakDays, taches });
  },

  completeOnboarding: async ({ prenom, universite, niveau }) => {
    const profile = await profileRepo.updateProfile({ prenom, universite, niveau, onboarded: true });
    set({ profile });
  },

  setAccentColor: async (color) => {
    const profile = await profileRepo.updateProfile({ accentColor: color });
    set({ profile });
  },

  setThemeMode: async (mode) => {
    const profile = await profileRepo.updateProfile({ themeMode: mode });
    set({ profile });
  },

  setNotificationsEnabled: async (enabled) => {
    const profile = await profileRepo.updateProfile({ notificationsEnabled: enabled });
    set({ profile });
  },

  setAvatarUri: async (uri) => {
    const profile = await profileRepo.updateProfile({ avatarUri: uri });
    set({ profile });
  },

  addMatiere: async (input) => {
    await matiereRepo.createMatiere(input);
    const matieres = await matiereRepo.listMatieres();
    set({ matieres });
  },

  addExamen: async (input) => {
    const created = await examenRepo.createExamen(input);
    const profile = get().profile;
    if (profile?.notificationsEnabled && input.alerte !== 'aucune') {
      const notificationId = await scheduleExamenReminder({
        titre: input.titre,
        dateIso: input.dateIso,
        heure: input.heure,
        alerte: input.alerte,
      });
      if (notificationId) {
        await examenRepo.setExamenNotificationId(created.id, notificationId);
      }
    }
    const examens = await examenRepo.listExamens();
    set({ examens });
  },

  setExamenNote: async (id, note) => {
    await examenRepo.setExamenNote(id, note);
    const examens = await examenRepo.listExamens();
    set({ examens });
  },

  markExamenDone: async (id) => {
    await examenRepo.markExamenDone(id);
    const examens = await examenRepo.listExamens();
    set({ examens });
  },

  removeExamen: async (id) => {
    const examen = get().examens.find((e) => e.id === id);
    if (examen?.notificationId) await cancelReminder(examen.notificationId);
    await examenRepo.deleteExamen(id);
    const examens = await examenRepo.listExamens();
    set({ examens });
  },

  addUe: async (nom, credits, couleur) => {
    await ueRepo.createUe(nom, credits, couleur);
    const ues = await ueRepo.listUes();
    set({ ues });
  },

  addCours: async (input) => {
    await edtRepo.createCours(input);
    const cours = await edtRepo.listCours();
    set({ cours });
  },

  loadTachesForDate: async (dateIso) => {
    const taches = await tacheRepo.listTachesForDate(dateIso);
    set({ taches, tachesDate: dateIso });
  },

  addTache: async (titre, dateIso, matiereId) => {
    await tacheRepo.createTache(titre, dateIso, matiereId);
    const taches = await tacheRepo.listTachesForDate(get().tachesDate);
    set({ taches });
  },

  toggleTache: async (id, fait) => {
    await tacheRepo.toggleTache(id, fait);
    const taches = await tacheRepo.listTachesForDate(get().tachesDate);
    set({ taches });
  },

  recordFocusSession: async (matiereId, dureeSecondes, completee) => {
    await focusRepo.createSession(matiereId, dureeSecondes, completee);
    if (matiereId && completee) {
      await matiereRepo.decrementHeuresRestantes(matiereId, dureeSecondes / 3600);
    }
    const [sessionsToday, streakDays, matieres] = await Promise.all([
      focusRepo.countSessionsToday(),
      focusRepo.computeStreakDays(),
      matiereRepo.listMatieres(),
    ]);
    set({ sessionsToday, streakDays, matieres });
  },
}));

import { getDb } from '../client';
import type { ThemeMode, UserProfile } from '../types';

interface ProfileRow {
  id: 1;
  prenom: string;
  universite: string;
  niveau: string;
  avatar_uri: string | null;
  accent_color: string;
  theme_mode: ThemeMode;
  onboarded: number;
  notifications_enabled: number;
}

function fromRow(row: ProfileRow): UserProfile {
  return {
    id: 1,
    prenom: row.prenom,
    universite: row.universite,
    niveau: row.niveau,
    avatarUri: row.avatar_uri,
    accentColor: row.accent_color,
    themeMode: row.theme_mode,
    onboarded: !!row.onboarded,
    notificationsEnabled: !!row.notifications_enabled,
  };
}

export async function getProfile(): Promise<UserProfile> {
  const db = await getDb();
  const row = await db.getFirstAsync<ProfileRow>(
    'SELECT * FROM user_profile WHERE id = 1'
  );
  if (!row) throw new Error('user_profile row missing');
  return fromRow(row);
}

export async function updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
  const db = await getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const map: Record<string, unknown> = {
    prenom: patch.prenom,
    universite: patch.universite,
    niveau: patch.niveau,
    avatar_uri: patch.avatarUri,
    accent_color: patch.accentColor,
    theme_mode: patch.themeMode,
    onboarded: patch.onboarded === undefined ? undefined : patch.onboarded ? 1 : 0,
    notifications_enabled:
      patch.notificationsEnabled === undefined ? undefined : patch.notificationsEnabled ? 1 : 0,
  };

  for (const [key, value] of Object.entries(map)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value as string | number | null);
    }
  }

  if (fields.length > 0) {
    await db.runAsync(`UPDATE user_profile SET ${fields.join(', ')} WHERE id = 1`, values);
  }

  return getProfile();
}

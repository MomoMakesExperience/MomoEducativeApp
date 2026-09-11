const JOURS = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
const MOIS = [
  'janv',
  'fevr',
  'mars',
  'avr',
  'mai',
  'juin',
  'juil',
  'aout',
  'sept',
  'oct',
  'nov',
  'dec',
];

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateShort(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateIso;
  return `${JOURS[d.getDay()]}. ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

export function formatDateFull(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateIso;
  const moisComplets = [
    'janvier',
    'fevrier',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'aout',
    'septembre',
    'octobre',
    'novembre',
    'decembre',
  ];
  return `${JOURS[d.getDay()]}. ${d.getDate()} ${moisComplets[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysLeft(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateIso}T00:00:00`);
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function countdownLabel(dateIso: string): string {
  const n = daysLeft(dateIso);
  if (n <= 0) return "aujourd'hui";
  if (n === 1) return '1 jour restant';
  return `${n} jours restants`;
}

export function weekdayShort(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`);
  const map = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return map[d.getDay()];
}

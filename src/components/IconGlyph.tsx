import React from 'react';
import { Award, BookOpen, Calculator, Code2, Globe, FlaskConical } from 'lucide-react-native';
import type { IconName } from '@/db/types';

const MAP: Record<IconName, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  award: Award,
  book: BookOpen,
  calculator: Calculator,
  code: Code2,
  globe: Globe,
  flask: FlaskConical,
};

export function IconGlyph({
  name,
  size = 20,
  color = '#fff',
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const Cmp = MAP[name] ?? Award;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}

export const ICON_NAMES: IconName[] = ['award', 'book', 'calculator', 'code', 'globe', 'flask'];

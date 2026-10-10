import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/**
 * Design tokens for the series.
 * Ink-indigo night studio; one colour per concept, used identically in
 * diagrams, captions and code so viewers learn the colour code.
 */
export const C = {
  ink: '#14143A',
  inkDeep: '#0C0C26',
  inkRaised: '#1E1E4A',
  paper: '#F3F1FF',
  muted: '#A9A5D6',
  faint: 'rgba(214, 208, 255, 0.14)',
};

export type ConceptKey = 'dotnet' | 'csharp' | 'aspnet' | 'api' | 'neutral' | 'warm' | 'str' | 'int' | 'bool';

export const CONCEPT: Record<ConceptKey, {main: string; deep: string; glow: string}> = {
  dotnet: {main: '#9A7BFF', deep: '#5A3BD8', glow: 'rgba(154,123,255,0.55)'},
  csharp: {main: '#3FE0A0', deep: '#16935F', glow: 'rgba(63,224,160,0.5)'},
  aspnet: {main: '#56CFF5', deep: '#1B86B4', glow: 'rgba(86,207,245,0.5)'},
  api: {main: '#FFB84D', deep: '#C27A12', glow: 'rgba(255,184,77,0.5)'},
  neutral: {main: '#C9C4F2', deep: '#4A4680', glow: 'rgba(201,196,242,0.35)'},
  warm: {main: '#FF8FA8', deep: '#B9476A', glow: 'rgba(255,143,168,0.45)'},
  // C# data types (Day 2+): text, whole numbers, true/false
  str: {main: '#FF9EB5', deep: '#B4466E', glow: 'rgba(255,158,181,0.45)'},
  int: {main: '#6CC7FF', deep: '#1F72B4', glow: 'rgba(108,199,255,0.45)'},
  bool: {main: '#FFC85C', deep: '#B98315', glow: 'rgba(255,200,92,0.45)'},
};

export const FONT = {
  display: 'Lexend, "Segoe UI", Arial, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
};

let fontsRequested = false;
export const loadFonts = () => {
  if (fontsRequested) return;
  fontsRequested = true;
  for (const w of ['300', '400', '500', '600', '700', '800']) {
    loadFont({family: 'Lexend', url: staticFile(`fonts/lexend-latin-${w}-normal.woff2`), weight: w});
  }
  for (const w of ['400', '500', '700']) {
    loadFont({
      family: 'JetBrains Mono',
      url: staticFile(`fonts/jetbrains-mono-latin-${w}-normal.woff2`),
      weight: w,
    });
  }
};

/** '#9A7BFF' + 0.4 -> 'rgba(154,123,255,0.4)' */
export const hexA = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
};

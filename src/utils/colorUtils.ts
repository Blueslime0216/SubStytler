/**
 * Convert #RRGGBB or #RGB hex string to RGB object.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const intVal = parseInt(clean, 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function isColor(str: any): boolean {
  if (typeof str !== 'string') return false;
  // 간단한 색상 문자열 형식 확인 (hex, rgb, rgba)
  return /^#([0-9a-f]{3,8})$/i.test(str) || /^rgba?\(/.test(str);
}

export function interpolateColor(
  startHex: string,
  endHex: string,
  progress: number
): string {
  const s = hexToRgb(startHex);
  const e = hexToRgb(endHex);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const p = clamp(progress);
  const r = Math.round(s.r + (e.r - s.r) * p);
  const g = Math.round(s.g + (e.g - s.g) * p);
  const b = Math.round(s.b + (e.b - s.b) * p);
  return rgbToHex(r, g, b);
} 
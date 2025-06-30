export interface EasingCurve {
  /** Unique identifier. Built-in curves have predictable IDs like 'linear'. */
  id: string;
  /** Human-readable name to show in UI. */
  name: string;
  /** First control point (normalized 0-1). */
  p1x: number;
  p1y: number;
  /** Second control point (normalized 0-1). */
  p2x: number;
  p2y: number;
  /** If true, UI should prevent deleting or renaming this curve. */
  builtIn?: boolean;
} 
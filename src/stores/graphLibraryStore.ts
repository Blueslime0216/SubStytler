import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { EasingCurve } from '../types/easing';

// ---------------------------------------------------------------------------
// Built-in, non-removable easing curves
// ---------------------------------------------------------------------------
const BUILT_IN_CURVES: EasingCurve[] = [
  {
    id: 'linear',
    name: 'Linear',
    p1x: 0,
    p1y: 0,
    p2x: 1,
    p2y: 1,
    builtIn: true,
  },
  {
    id: 'ease-in',
    name: 'Ease In',
    p1x: 0.42,
    p1y: 0,
    p2x: 1,
    p2y: 1,
    builtIn: true,
  },
  {
    id: 'ease-out',
    name: 'Ease Out',
    p1x: 0,
    p1y: 0,
    p2x: 0.58,
    p2y: 1,
    builtIn: true,
  },
  {
    id: 'ease-in-out',
    name: 'Ease In Out',
    p1x: 0.42,
    p1y: 0,
    p2x: 0.58,
    p2y: 1,
    builtIn: true,
  },
  {
    id: 'cubic',
    name: 'Cubic',
    p1x: 0.65,
    p1y: 0,
    p2x: 0.35,
    p2y: 1,
    builtIn: true,
  },
];

// Convert built-in list to record for faster lookup
const builtInRecord: Record<string, EasingCurve> = BUILT_IN_CURVES.reduce(
  (acc, curve) => ({ ...acc, [curve.id]: curve }),
  {}
);

// ---------------------------------------------------------------------------
// Store definition
// ---------------------------------------------------------------------------
interface GraphLibraryState {
  curves: Record<string, EasingCurve>; // Map by id
  addCurve: (curve: Omit<EasingCurve, 'id' | 'builtIn'> & { id?: string }) => string; // returns id
  updateCurve: (curve: EasingCurve) => void;
  deleteCurve: (id: string) => void;
  importCurves: (list: EasingCurve[]) => void;
}

export const useGraphLibraryStore = create<GraphLibraryState>()(
  persist(
    (set, get) => ({
      curves: builtInRecord,

      addCurve: (curveInput) => {
        const id = curveInput.id ?? nanoid(8);
        const curve: EasingCurve = {
          builtIn: false,
          ...curveInput,
          id,
        } as EasingCurve;

        set((state) => ({
          curves: { ...state.curves, [id]: curve },
        }));
        return id;
      },

      updateCurve: (curve) => {
        set((state) => {
          const existing = state.curves[curve.id];
          if (existing?.builtIn) {
            // Built-in curves cannot be edited.
            return {} as Partial<GraphLibraryState>;
          }
          return {
            curves: {
              ...state.curves,
              [curve.id]: { ...existing, ...curve },
            },
          };
        });
      },

      deleteCurve: (id) => {
        set((state) => {
          const target = state.curves[id];
          if (!target || target.builtIn) return {} as Partial<GraphLibraryState>;
          const { [id]: _, ...rest } = state.curves;
          return { curves: rest } as Partial<GraphLibraryState>;
        });
      },

      importCurves: (list) => {
        set((state) => {
          const additions = list.reduce<Record<string, EasingCurve>>((acc, c) => {
            if (c.builtIn) return acc; // ignore built-in in imported list
            acc[c.id] = { ...c, builtIn: false };
            return acc;
          }, {});

          return { curves: { ...state.curves, ...additions } } as Partial<GraphLibraryState>;
        });
      },
    }),
    {
      name: 'graph-library-storage',
    }
  )
); 
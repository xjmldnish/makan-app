export interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Entry {
  id: string;
  name: string;
  emoji: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  portion: string;
  notes: string;
  time: string;
}

export interface Food {
  name: string;
  emoji?: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  portion?: string;
  notes?: string;
}

export interface BuiltinFood {
  id: string;
  name: string;
  cat: string;
  emoji: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  serving: string;
}

/** Shape returned by the recognise Server Action. */
export interface RecogItem {
  name: string;
  portion?: string;
  est_grams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: "high" | "medium" | "low" | string;
}

export type Totals = { kcal: number; p: number; c: number; f: number };
export type MacroKey = "kcal" | "p" | "c" | "f";

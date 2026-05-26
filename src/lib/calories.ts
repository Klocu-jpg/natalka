// Mifflin-St Jeor BMR + activity multipliers + goal adjustment

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";
export type BiologicalSex = "male" | "female";

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Siedzący tryb (brak ruchu)",
  light: "Lekka aktywność (1-3 dni/tydz.)",
  moderate: "Umiarkowana (3-5 dni/tydz.)",
  active: "Aktywny (6-7 dni/tydz.)",
  very_active: "Bardzo aktywny (2x dziennie)",
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "Redukcja (-500 kcal)",
  maintain: "Utrzymanie wagi",
  gain: "Przyrost masy (+400 kcal)",
};

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 400,
};

export interface CalorieInput {
  sex: BiologicalSex | string | null | undefined;
  birthYear: number | null | undefined;
  heightCm: number | null | undefined;
  weightKg: number | null | undefined;
  activity: ActivityLevel | string | null | undefined;
  goal: Goal | string | null | undefined;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  target: number;
  age: number;
}

export const calculateCalories = (input: CalorieInput): CalorieResult | null => {
  const { sex, birthYear, heightCm, weightKg, activity, goal } = input;
  if (!sex || !birthYear || !heightCm || !weightKg) return null;

  const currentYear = new Date().getFullYear();
  const age = currentYear - Number(birthYear);
  if (age < 10 || age > 120) return null;

  const w = Number(weightKg);
  const h = Number(heightCm);
  const bmr =
    sex === "male"
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;

  const mult = ACTIVITY_MULTIPLIER[(activity as ActivityLevel) ?? "moderate"] ?? 1.55;
  const adj = GOAL_ADJUSTMENT[(goal as Goal) ?? "maintain"] ?? 0;

  const tdee = bmr * mult;
  const target = tdee + adj;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    age,
  };
};
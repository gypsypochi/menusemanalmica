import { MEAL_SLOTS } from './mealsStorage'
import type { DayMeals, MealSlot } from './mealsStorage'

export type DailyFoodLog = {
  meals: DayMeals
  notes?: string
}

export type FoodLogMap = Record<string, DailyFoodLog>

const FOOD_LOG_STORAGE_KEY = 'menu_semanal_food_log_v1'

const VALID_SLOTS: MealSlot[] = ['desayuno', 'almuerzo', 'merienda', 'cena']

function sanitizeDailyLog(raw: unknown): DailyFoodLog | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>

  const meals: DayMeals = {}
  if (obj.meals && typeof obj.meals === 'object' && !Array.isArray(obj.meals)) {
    const rawMeals = obj.meals as Record<string, unknown>
    for (const slot of VALID_SLOTS) {
      const val = rawMeals[slot]
      if (typeof val === 'string' && val.trim()) {
        meals[slot] = val.trim()
      }
    }
  }

  const notes = typeof obj.notes === 'string' && obj.notes.trim() ? obj.notes.trim() : undefined

  if (Object.keys(meals).length === 0 && !notes) {
    return null
  }

  return notes ? { meals, notes } : { meals }
}

export function loadFoodLogs(): FoodLogMap {
  try {
    const raw = window.localStorage.getItem(FOOD_LOG_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    const result: FoodLogMap = {}
    for (const [dateKey, entry] of Object.entries(parsed as Record<string, unknown>)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue
      const sanitized = sanitizeDailyLog(entry)
      if (sanitized) {
        result[dateKey] = sanitized
      }
    }
    return result
  } catch {
    return {}
  }
}

export function saveFoodLogs(logs: FoodLogMap): void {
  try {
    window.localStorage.setItem(FOOD_LOG_STORAGE_KEY, JSON.stringify(logs))
  } catch {
    // Ignorar errores de almacenamiento si el navegador restringe localStorage
  }
}

export function countLoggedMeals(dayLog?: DailyFoodLog): number {
  if (!dayLog || !dayLog.meals) return 0
  return MEAL_SLOTS.reduce((acc, slot) => {
    const val = dayLog.meals[slot.id]?.trim()
    return val ? acc + 1 : acc
  }, 0)
}

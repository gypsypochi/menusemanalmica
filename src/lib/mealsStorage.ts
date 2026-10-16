import { Coffee, Moon, Sun, Sunset } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type MealSlot = 'desayuno' | 'almuerzo' | 'merienda' | 'cena'

export type DayMeals = Partial<Record<MealSlot, string>>

export type PlannedMealsMap = Record<string, DayMeals>

export type MealSlotInfo = {
  id: MealSlot
  name: string
  detail: string
  placeholder: string
  icon: LucideIcon
  tone: string
}

export const MEAL_SLOTS: MealSlotInfo[] = [
  {
    id: 'desayuno',
    name: 'Desayuno',
    detail: 'Algo rico para empezar',
    placeholder: 'Ej: Tostadas con queso crema y café con leche',
    icon: Coffee,
    tone: 'meal-icon--peach',
  },
  {
    id: 'almuerzo',
    name: 'Almuerzo',
    detail: 'La comida principal',
    placeholder: 'Ej: Tartita de verdura con ensalada fresca',
    icon: Sun,
    tone: 'meal-icon--yellow',
  },
  {
    id: 'merienda',
    name: 'Merienda',
    detail: 'Una pausa para vos',
    placeholder: 'Ej: Mate con budín casero o yogur con frutas',
    icon: Sunset,
    tone: 'meal-icon--pink',
  },
  {
    id: 'cena',
    name: 'Cena',
    detail: 'Algo para cerrar el día',
    placeholder: 'Ej: Sopa de calabaza o pollo al horno con papas',
    icon: Moon,
    tone: 'meal-icon--lilac',
  },
]

export const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
export const WEEKDAY_FULL_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
export const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function mondayOf(date: Date): Date {
  const result = new Date(date)
  const day = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - day)
  result.setHours(0, 0, 0, 0)
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatRange(start: Date): string {
  const end = addDays(start, 6)
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} de ${MONTH_NAMES[end.getMonth()]}`
  }
  return `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)}`
}

const STORAGE_KEY = 'menu_semanal_planned_meals_v1'

export function loadPlannedMeals(): PlannedMealsMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return parsed as PlannedMealsMap
    }
    return {}
  } catch {
    return {}
  }
}

export function savePlannedMeals(meals: PlannedMealsMap): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meals))
  } catch {
    // Ignorar errores de almacenamiento si el navegador restringe localStorage
  }
}

export function countDayMeals(dayMeals?: DayMeals): number {
  if (!dayMeals) return 0
  return MEAL_SLOTS.reduce((acc, slot) => {
    const val = dayMeals[slot.id]?.trim()
    return val ? acc + 1 : acc
  }, 0)
}

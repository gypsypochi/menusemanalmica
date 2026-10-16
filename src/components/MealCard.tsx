import { Coffee, Moon, Sun, Sunset } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type Meal = { name: string; detail: string; icon: LucideIcon; tone: string }

const meals: Meal[] = [
  { name: 'Desayuno', detail: 'Algo rico para empezar', icon: Coffee, tone: 'meal-icon--peach' },
  { name: 'Almuerzo', detail: 'La comida principal', icon: Sun, tone: 'meal-icon--yellow' },
  { name: 'Merienda', detail: 'Una pausa para vos', icon: Sunset, tone: 'meal-icon--pink' },
  { name: 'Cena', detail: 'Algo para cerrar el día', icon: Moon, tone: 'meal-icon--lilac' },
]

export default function MealCard() {
  return (
    <div className="meal-list">
      {meals.map(({ name, detail, icon: Icon, tone }) => (
        <div className="meal-row" key={name}>
          <div className={`meal-icon ${tone}`}><Icon size={19} strokeWidth={1.8} /></div>
          <div className="meal-copy"><strong>{name}</strong><span>{detail}</span></div>
          <span className="meal-empty">Sin planificar</span>
        </div>
      ))}
    </div>
  )
}

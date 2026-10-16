import { MEAL_SLOTS } from '../lib/mealsStorage'
import type { DayMeals, MealSlot } from '../lib/mealsStorage'

type MealCardProps = {
  dayMeals?: DayMeals
  onSelectSlot?: (slot: MealSlot) => void
}

export default function MealCard({ dayMeals, onSelectSlot }: MealCardProps) {
  return (
    <div className="meal-list">
      {MEAL_SLOTS.map(({ id, name, detail, icon: Icon, tone }) => {
        const plannedText = dayMeals?.[id]?.trim()
        return (
          <div
            className={`meal-row ${onSelectSlot ? 'meal-row--interactive' : ''}`}
            key={id}
            onClick={onSelectSlot ? () => onSelectSlot(id) : undefined}
          >
            <div className={`meal-icon ${tone}`}>
              <Icon size={19} strokeWidth={1.8} />
            </div>
            <div className="meal-copy">
              <strong>{name}</strong>
              <span className={plannedText ? 'meal-copy-planned' : ''}>
                {plannedText || detail}
              </span>
            </div>
            {plannedText ? (
              <span className="meal-planned-badge">Planificado</span>
            ) : (
              <span className="meal-empty">Sin planificar</span>
            )}
          </div>
        )
      })}
    </div>
  )
}


import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  MEAL_SLOTS,
  MONTH_NAMES,
  WEEKDAY_FULL_NAMES,
  WEEKDAY_NAMES,
  addDays,
  countDayMeals,
  formatRange,
  mondayOf,
  toDateKey,
} from '../lib/mealsStorage'
import type { MealSlot, PlannedMealsMap } from '../lib/mealsStorage'

type WeeklyMenuProps = {
  weekOffset: number
  onChangeWeekOffset: (updater: number | ((prev: number) => number)) => void
  selectedDay: number
  onChangeSelectedDay: (dayIndex: number) => void
  plannedMeals: PlannedMealsMap
  onSaveMeal: (dateKey: string, slot: MealSlot, value: string) => void
  onDeleteMeal: (dateKey: string, slot: MealSlot) => void
  onClearDayMeals: (dateKey: string) => void
  initialEditingSlot?: MealSlot | null
  onClearInitialEditingSlot?: () => void
}

export default function WeeklyMenu({
  weekOffset,
  onChangeWeekOffset,
  selectedDay,
  onChangeSelectedDay,
  plannedMeals,
  onSaveMeal,
  onDeleteMeal,
  onClearDayMeals,
  initialEditingSlot,
  onClearInitialEditingSlot,
}: WeeklyMenuProps) {
  const [editingSlot, setEditingSlot] = useState<MealSlot | null>(null)
  const [draftText, setDraftText] = useState('')

  const weekStart = useMemo(() => {
    const monday = mondayOf(new Date())
    monday.setDate(monday.getDate() + weekOffset * 7)
    return monday
  }, [weekOffset])

  const selectedDate = useMemo(() => addDays(weekStart, selectedDay), [weekStart, selectedDay])
  const selectedDateKey = toDateKey(selectedDate)
  const dayMeals = plannedMeals[selectedDateKey] || {}
  const plannedCount = countDayMeals(dayMeals)

  const today = new Date()
  const currentWeek = weekOffset === 0

  useEffect(() => {
    if (initialEditingSlot) {
      setEditingSlot(initialEditingSlot)
      setDraftText(plannedMeals[selectedDateKey]?.[initialEditingSlot] ?? '')
      onClearInitialEditingSlot?.()
    }
  }, [initialEditingSlot, selectedDateKey, plannedMeals, onClearInitialEditingSlot])

  const startEditing = (slot: MealSlot) => {
    setEditingSlot(slot)
    setDraftText(dayMeals[slot] ?? '')
  }

  const cancelEditing = () => {
    setEditingSlot(null)
    setDraftText('')
  }

  const handleSave = (slot: MealSlot) => {
    const trimmed = draftText.trim()
    if (trimmed) {
      onSaveMeal(selectedDateKey, slot, trimmed)
    } else {
      onDeleteMeal(selectedDateKey, slot)
    }
    setEditingSlot(null)
    setDraftText('')
  }

  const handleDaySelect = (index: number) => {
    setEditingSlot(null)
    setDraftText('')
    onChangeSelectedDay(index)
  }

  const handleWeekChange = (updater: number | ((prev: number) => number)) => {
    setEditingSlot(null)
    setDraftText('')
    onChangeWeekOffset(updater)
  }

  const totalWeekMeals = useMemo(() => {
    let total = 0
    for (let i = 0; i < 7; i++) {
      const dateKey = toDateKey(addDays(weekStart, i))
      total += countDayMeals(plannedMeals[dateKey])
    }
    return total
  }, [weekStart, plannedMeals])

  return (
    <div className="dashboard-page">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} /> ORGANIZACIÓN FLEXIBLE
          </div>
          <h1>Menú semanal</h1>
          <p className="welcome-subtitle">
            Pensá tus comidas con tiempo, sin exigirte de más. Podés cambiarlas cuando quieras.
          </p>
        </div>
        <div className="week-summary-badge">
          <strong>{totalWeekMeals}</strong>
          <span>{totalWeekMeals === 1 ? 'comida planificada esta semana' : 'comidas planificadas esta semana'}</span>
        </div>
      </section>

      <section className="week-toolbar">
        <div className="week-title">
          <div className="section-icon">
            <CalendarDays size={19} />
          </div>
          <div>
            <h2>Semana seleccionada</h2>
            <p>{formatRange(weekStart)}</p>
          </div>
        </div>
        <div className="week-controls">
          <button
            className="icon-button"
            aria-label="Semana anterior"
            onClick={() => handleWeekChange((v) => v - 1)}
          >
            <ChevronLeft size={19} />
          </button>
          <button className="today-button" onClick={() => handleWeekChange(0)}>
            Esta semana
          </button>
          <button
            className="icon-button"
            aria-label="Semana siguiente"
            onClick={() => handleWeekChange((v) => v + 1)}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </section>

      <section className="day-strip" aria-label="Elegir día">
        {WEEKDAY_NAMES.map((day, index) => {
          const date = addDays(weekStart, index)
          const dateKey = toDateKey(date)
          const count = countDayMeals(plannedMeals[dateKey])
          const isToday = currentWeek && date.toDateString() === today.toDateString()
          return (
            <button
              key={day}
              className={`day-button ${selectedDay === index ? 'day-button--selected' : ''} ${
                isToday ? 'day-button--today' : ''
              }`}
              onClick={() => handleDaySelect(index)}
            >
              <span>{day}</span>
              <strong>{date.getDate()}</strong>
              {count > 0 ? (
                <small className="day-meal-count">{count}/4</small>
              ) : (
                isToday && <i />
              )}
            </button>
          )
        })}
      </section>

      <div className="menu-layout-grid">
        <section className="panel menu-day-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">PLAN DEL DÍA</span>
              <h2>
                {WEEKDAY_FULL_NAMES[selectedDay]} {selectedDate.getDate()} de{' '}
                {MONTH_NAMES[selectedDate.getMonth()]}
              </h2>
            </div>
            <div className="menu-day-actions">
              <span className="date-pill">{plannedCount} de 4 comidas</span>
              {plannedCount > 0 && (
                <button
                  className="clear-day-button"
                  onClick={() => {
                    cancelEditing()
                    onClearDayMeals(selectedDateKey)
                  }}
                >
                  <Trash2 size={13} /> Vaciar día
                </button>
              )}
            </div>
          </div>
          <p className="panel-description">
            Elegí qué te gustaría comer en cada momento del día. Si un día queda libre, no pasa nada.
          </p>

          <div className="menu-slot-list">
            {MEAL_SLOTS.map(({ id, name, detail, placeholder, icon: Icon, tone }) => {
              const currentValue = dayMeals[id]?.trim() || ''
              const isEditing = editingSlot === id

              return (
                <div
                  key={id}
                  className={`menu-slot-card ${currentValue ? 'menu-slot-card--filled' : ''} ${
                    isEditing ? 'menu-slot-card--editing' : ''
                  }`}
                >
                  <div className="menu-slot-header">
                    <div className={`meal-icon ${tone}`}>
                      <Icon size={19} strokeWidth={1.8} />
                    </div>
                    <div className="meal-copy">
                      <strong>{name}</strong>
                      <span>{detail}</span>
                    </div>

                    {!isEditing && (
                      <div className="menu-slot-buttons">
                        {currentValue ? (
                          <>
                            <button
                              type="button"
                              className="slot-action-btn"
                              aria-label={`Editar ${name}`}
                              onClick={() => startEditing(id)}
                            >
                              <Pencil size={14} /> Editar
                            </button>
                            <button
                              type="button"
                              className="slot-action-btn slot-action-btn--danger"
                              aria-label={`Eliminar ${name}`}
                              onClick={() => onDeleteMeal(selectedDateKey, id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="slot-add-btn"
                            onClick={() => startEditing(id)}
                          >
                            <Plus size={14} /> Agregar
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <form
                      className="menu-slot-editor"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSave(id)
                      }}
                    >
                      <input
                        type="text"
                        className="menu-slot-input"
                        placeholder={placeholder}
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        autoFocus
                      />
                      <div className="menu-slot-editor-actions">
                        <button type="submit" className="slot-save-btn">
                          <Check size={14} /> Guardar
                        </button>
                        <button
                          type="button"
                          className="slot-cancel-btn"
                          onClick={cancelEditing}
                        >
                          <X size={14} /> Cancelar
                        </button>
                      </div>
                    </form>
                  ) : currentValue ? (
                    <div className="menu-slot-content" onClick={() => startEditing(id)}>
                      <p>{currentValue}</p>
                    </div>
                  ) : (
                    <div className="menu-slot-empty" onClick={() => startEditing(id)}>
                      <span>Sin planificar · Tocá para anotar una idea</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="panel menu-week-overview">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">VISTA RÁPIDA</span>
              <h2>Resumen de la semana</h2>
            </div>
          </div>
          <p className="panel-description">
            Un vistazo general de los 7 días. Tocá cualquier día para ver o editar sus comidas.
          </p>

          <div className="week-overview-list">
            {WEEKDAY_FULL_NAMES.map((dayName, idx) => {
              const date = addDays(weekStart, idx)
              const dateKey = toDateKey(date)
              const mealsForDay = plannedMeals[dateKey]
              const count = countDayMeals(mealsForDay)
              const isSelected = selectedDay === idx

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`week-overview-row ${isSelected ? 'week-overview-row--active' : ''}`}
                  onClick={() => handleDaySelect(idx)}
                >
                  <div className="week-overview-day">
                    <strong>{dayName}</strong>
                    <span>{date.getDate()} de {MONTH_NAMES[date.getMonth()].slice(0, 3)}</span>
                  </div>
                  <div className="week-overview-meals">
                    {count === 0 ? (
                      <span className="overview-empty">Día libre / sin comidas cargadas</span>
                    ) : (
                      <div className="overview-pills">
                        {MEAL_SLOTS.map((slot) => {
                          const text = mealsForDay?.[slot.id]?.trim()
                          if (!text) return null
                          return (
                            <span key={slot.id} className="overview-meal-pill">
                              <strong>{slot.name.slice(0, 3)}:</strong> {text}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <span className={`overview-count ${count > 0 ? 'overview-count--has' : ''}`}>
                    {count}/4
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquareHeart,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { countLoggedMeals } from '../lib/foodLogStorage'
import type { FoodLogMap } from '../lib/foodLogStorage'
import {
  MEAL_SLOTS,
  MONTH_NAMES,
  WEEKDAY_FULL_NAMES,
  WEEKDAY_NAMES,
  addDays,
  formatRange,
  mondayOf,
  toDateKey,
} from '../lib/mealsStorage'
import type { MealSlot, PlannedMealsMap } from '../lib/mealsStorage'

type FoodLogProps = {
  weekOffset: number
  onChangeWeekOffset: (updater: number | ((prev: number) => number)) => void
  selectedDay: number
  onChangeSelectedDay: (dayIndex: number) => void
  plannedMeals: PlannedMealsMap
  foodLogs: FoodLogMap
  onSaveLoggedMeal: (dateKey: string, slot: MealSlot, value: string) => void
  onDeleteLoggedMeal: (dateKey: string, slot: MealSlot) => void
  onSaveDayNotes: (dateKey: string, notes: string) => void
}

export default function FoodLog({
  weekOffset,
  onChangeWeekOffset,
  selectedDay,
  onChangeSelectedDay,
  plannedMeals,
  foodLogs,
  onSaveLoggedMeal,
  onDeleteLoggedMeal,
  onSaveDayNotes,
}: FoodLogProps) {
  const [editingSlot, setEditingSlot] = useState<MealSlot | null>(null)
  const [draftText, setDraftText] = useState('')

  const weekStart = useMemo(() => {
    const monday = mondayOf(new Date())
    monday.setDate(monday.getDate() + weekOffset * 7)
    return monday
  }, [weekOffset])

  const selectedDate = useMemo(() => addDays(weekStart, selectedDay), [weekStart, selectedDay])
  const selectedDateKey = toDateKey(selectedDate)

  const dayLog = foodLogs[selectedDateKey]
  const loggedMeals = dayLog?.meals || {}
  const plannedForDay = plannedMeals[selectedDateKey] || {}
  const loggedCount = countLoggedMeals(dayLog)

  const [notesDraft, setNotesDraft] = useState(dayLog?.notes ?? '')
  const [notesSavedToast, setNotesSavedToast] = useState(false)

  useEffect(() => {
    setNotesDraft(foodLogs[selectedDateKey]?.notes ?? '')
    setNotesSavedToast(false)
  }, [selectedDateKey, foodLogs])

  const today = new Date()
  const currentWeek = weekOffset === 0

  const startEditing = (slot: MealSlot) => {
    setEditingSlot(slot)
    setDraftText(loggedMeals[slot] ?? '')
  }

  const cancelEditing = () => {
    setEditingSlot(null)
    setDraftText('')
  }

  const handleSaveSlot = (slot: MealSlot) => {
    const trimmed = draftText.trim()
    if (trimmed) {
      onSaveLoggedMeal(selectedDateKey, slot, trimmed)
    } else {
      onDeleteLoggedMeal(selectedDateKey, slot)
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

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveDayNotes(selectedDateKey, notesDraft.trim())
    setNotesSavedToast(true)
    window.setTimeout(() => setNotesSavedToast(false), 2200)
  }

  const handleClearNotes = () => {
    setNotesDraft('')
    onSaveDayNotes(selectedDateKey, '')
    setNotesSavedToast(false)
  }

  const totalWeekLogged = useMemo(() => {
    let total = 0
    for (let i = 0; i < 7; i++) {
      const dateKey = toDateKey(addDays(weekStart, i))
      total += countLoggedMeals(foodLogs[dateKey])
    }
    return total
  }, [weekStart, foodLogs])

  const currentSavedNotes = dayLog?.notes ?? ''
  const notesChanged = notesDraft.trim() !== currentSavedNotes

  return (
    <div className="dashboard-page">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} /> REGISTRO SIN EXIGENCIAS
          </div>
          <h1>Lo que comí</h1>
          <p className="welcome-subtitle">
            Anotá tus comidas reales con libertad. Si cambiaron los planes o un momento quedó sin registrar, está todo bien.
          </p>
        </div>
        <div className="week-summary-badge">
          <strong>{totalWeekLogged}</strong>
          <span>
            {totalWeekLogged === 1
              ? 'comida registrada esta semana'
              : 'comidas registradas esta semana'}
          </span>
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
          const count = countLoggedMeals(foodLogs[dateKey])
          const hasNotes = Boolean(foodLogs[dateKey]?.notes)
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
                <small className="day-meal-count day-meal-count--logged">{count}/4</small>
              ) : hasNotes ? (
                <small className="day-meal-count day-meal-count--logged">Nota</small>
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
              <span className="panel-kicker">REGISTRO REAL DEL DÍA</span>
              <h2>
                {WEEKDAY_FULL_NAMES[selectedDay]} {selectedDate.getDate()} de{' '}
                {MONTH_NAMES[selectedDate.getMonth()]}
              </h2>
            </div>
            <div className="menu-day-actions">
              <span className="date-pill">{loggedCount} de 4 registradas</span>
            </div>
          </div>
          <p className="panel-description">
            Registrá lo que comiste hoy o en días anteriores. Tu menú planificado aparece debajo como referencia tranquila, sin modificarse.
          </p>

          <div className="menu-slot-list">
            {MEAL_SLOTS.map(({ id, name, detail, placeholder, icon: Icon, tone }) => {
              const actualValue = loggedMeals[id]?.trim() || ''
              const plannedValue = plannedForDay[id]?.trim() || ''
              const isEditing = editingSlot === id

              return (
                <div
                  key={id}
                  className={`menu-slot-card ${actualValue ? 'menu-slot-card--filled' : ''} ${
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
                        {actualValue ? (
                          <>
                            <button
                              type="button"
                              className="slot-action-btn"
                              aria-label={`Editar registro de ${name}`}
                              onClick={() => startEditing(id)}
                            >
                              <Pencil size={14} /> Editar
                            </button>
                            <button
                              type="button"
                              className="slot-action-btn slot-action-btn--danger"
                              aria-label={`Borrar registro de ${name}`}
                              onClick={() => onDeleteLoggedMeal(selectedDateKey, id)}
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
                            <Plus size={14} /> Registrar
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="planned-reference-bar">
                    <span className="planned-ref-badge">Planificado</span>
                    <span className={plannedValue ? 'planned-ref-text' : 'planned-ref-empty'}>
                      {plannedValue || 'Sin comida planificada para este momento'}
                    </span>
                  </div>

                  {isEditing ? (
                    <form
                      className="menu-slot-editor"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSaveSlot(id)
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
                          <Check size={14} /> Guardar registro
                        </button>
                        {plannedValue && draftText.trim() !== plannedValue && (
                          <button
                            type="button"
                            className="slot-cancel-btn"
                            onClick={() => setDraftText(plannedValue)}
                          >
                            Usar lo planificado
                          </button>
                        )}
                        <button
                          type="button"
                          className="slot-cancel-btn"
                          onClick={cancelEditing}
                        >
                          <X size={14} /> Cancelar
                        </button>
                      </div>
                    </form>
                  ) : actualValue ? (
                    <div className="foodlog-actual-box" onClick={() => startEditing(id)}>
                      <span className="actual-badge">Lo que comí</span>
                      <p>{actualValue}</p>
                    </div>
                  ) : (
                    <div className="menu-slot-empty" onClick={() => startEditing(id)}>
                      <span>Sin registrar · Tocá si querés anotar lo que comiste</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <div className="foodlog-side-column">
          <section className="panel foodlog-notes-panel">
            <div className="panel-heading">
              <div className="shopping-heading-icon">
                <MessageSquareHeart size={19} />
              </div>
              <div>
                <span className="panel-kicker">ESPACIO PERSONAL</span>
                <h2>Observaciones del día</h2>
              </div>
            </div>
            <p className="panel-description">
              Opcional: cómo te sentiste, si comiste afuera, si sobró comida o cualquier nota que te sirva.
            </p>

            <form className="foodlog-notes-form" onSubmit={handleSaveNotes}>
              <textarea
                className="foodlog-notes-textarea"
                rows={4}
                placeholder="Ej: Almorcé con amigas, quedó tarta lista para mañana..."
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
              />
              <div className="foodlog-notes-actions">
                <button
                  type="submit"
                  className="slot-save-btn"
                  disabled={!notesChanged && !notesSavedToast}
                >
                  <Check size={14} /> {notesSavedToast ? 'Guardado' : 'Guardar nota'}
                </button>
                {currentSavedNotes && (
                  <button
                    type="button"
                    className="slot-action-btn slot-action-btn--danger"
                    onClick={handleClearNotes}
                  >
                    <Trash2 size={13} /> Borrar nota
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="panel menu-week-overview">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">RECORRIDO DE LA SEMANA</span>
                <h2>Días de esta semana</h2>
              </div>
            </div>
            <p className="panel-description">
              Consultá o completá cualquier día de la semana seleccionada.
            </p>

            <div className="week-overview-list">
              {WEEKDAY_FULL_NAMES.map((dayName, idx) => {
                const date = addDays(weekStart, idx)
                const dateKey = toDateKey(date)
                const logForDay = foodLogs[dateKey]
                const count = countLoggedMeals(logForDay)
                const hasNote = Boolean(logForDay?.notes)
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
                      <span>
                        {date.getDate()} de {MONTH_NAMES[date.getMonth()].slice(0, 3)}
                      </span>
                    </div>
                    <div className="week-overview-meals">
                      {count === 0 && !hasNote ? (
                        <span className="overview-empty">Sin registros cargados</span>
                      ) : (
                        <div className="overview-pills">
                          {MEAL_SLOTS.map((slot) => {
                            const text = logForDay?.meals?.[slot.id]?.trim()
                            if (!text) return null
                            return (
                              <span key={slot.id} className="overview-meal-pill">
                                <strong>{slot.name.slice(0, 3)}:</strong> {text}
                              </span>
                            )
                          })}
                          {hasNote && (
                            <span className="overview-note-pill">Nota del día</span>
                          )}
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
    </div>
  )
}

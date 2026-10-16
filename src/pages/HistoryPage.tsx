import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquareHeart,
  ShoppingBasket,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Section } from '../components/Sidebar'
import { countLoggedMeals } from '../lib/foodLogStorage'
import type { FoodLogMap } from '../lib/foodLogStorage'
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
import type { PlannedMealsMap } from '../lib/mealsStorage'
import { formatItemAmount } from '../lib/shoppingStorage'
import type { ShoppingItem } from '../lib/shoppingStorage'

type HistoryPageProps = {
  plannedMeals: PlannedMealsMap
  foodLogs: FoodLogMap
  shoppingItems: ShoppingItem[]
  onNavigateToDay: (section: 'menu' | 'registro', weekOffset: number, dayIndex: number) => void
  onNavigateSection: (section: Section) => void
}

function parseLocalDateKey(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  return new Date(year, month, day)
}

function getWeekLabel(offset: number): string {
  if (offset === 0) return 'Esta semana'
  if (offset === -1) return 'Semana pasada'
  return `Hace ${Math.abs(offset)} semanas`
}

export default function HistoryPage({
  plannedMeals,
  foodLogs,
  shoppingItems,
  onNavigateToDay,
  onNavigateSection,
}: HistoryPageProps) {
  const [selectedOffset, setSelectedOffset] = useState<number>(0)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  const currentMonday = useMemo(() => mondayOf(new Date()), [])

  // Semanas disponibles en orden cronológico inverso (más reciente primero, sin semanas futuras > 0)
  const historyOffsets = useMemo(() => {
    const offsetsSet = new Set<number>([0, -1, -2, -3, -4, -5])

    const allKeys = [...Object.keys(plannedMeals), ...Object.keys(foodLogs)]
    for (const key of allKeys) {
      const parsed = parseLocalDateKey(key)
      if (!parsed) continue
      const itemMonday = mondayOf(parsed)
      const diffMs = itemMonday.getTime() - currentMonday.getTime()
      const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
      if (diffWeeks <= 0) {
        offsetsSet.add(diffWeeks)
      }
    }

    if (selectedOffset <= 0) {
      offsetsSet.add(selectedOffset)
    }

    return Array.from(offsetsSet).sort((a, b) => b - a)
  }, [plannedMeals, foodLogs, currentMonday, selectedOffset])

  const selectedWeekStart = useMemo(() => {
    return addDays(currentMonday, selectedOffset * 7)
  }, [currentMonday, selectedOffset])

  const daysData = useMemo(() => {
    return WEEKDAY_FULL_NAMES.map((fullName, idx) => {
      const date = addDays(selectedWeekStart, idx)
      const dateKey = toDateKey(date)
      const planned = plannedMeals[dateKey] || {}
      const log = foodLogs[dateKey]
      const actual = log?.meals || {}
      const notes = log?.notes?.trim() || ''
      const plannedCount = countDayMeals(planned)
      const loggedCount = countLoggedMeals(log)
      const hasActivity = plannedCount > 0 || loggedCount > 0 || Boolean(notes)

      return {
        idx,
        shortName: WEEKDAY_NAMES[idx],
        fullName,
        date,
        dateKey,
        planned,
        actual,
        notes,
        plannedCount,
        loggedCount,
        hasActivity,
      }
    })
  }, [selectedWeekStart, plannedMeals, foodLogs])

  const weekSummary = useMemo(() => {
    let plannedTotal = 0
    let loggedTotal = 0
    let daysWithActivity = 0

    for (const d of daysData) {
      plannedTotal += d.plannedCount
      loggedTotal += d.loggedCount
      if (d.hasActivity) daysWithActivity += 1
    }

    return {
      plannedTotal,
      loggedTotal,
      daysWithActivity,
      isEmpty: daysWithActivity === 0,
    }
  }, [daysData])

  const totalShopping = shoppingItems.length
  const checkedShopping = useMemo(
    () => shoppingItems.filter((item) => item.checked).length,
    [shoppingItems],
  )
  const pendingShopping = totalShopping - checkedShopping
  const pendingPreview = useMemo(
    () => shoppingItems.filter((item) => !item.checked).slice(0, 4),
    [shoppingItems],
  )

  const changeWeek = (nextOffset: number) => {
    setSelectedOffset(Math.min(0, nextOffset))
    setExpandedDay(null)
  }

  return (
    <div className="dashboard-page history-page-centered">
      <section className="welcome-row history-header-row">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} /> TU RECORRIDO, SIN EXIGENCIAS
          </div>
          <h1>Mi historial</h1>
          <p className="welcome-subtitle">
            Un vistazo compacto y claro de lo planificado y lo que realmente comiste cada semana.
          </p>
        </div>

        <div className="history-stats-row">
          <div className="counter-chip counter-chip--checked">
            <strong>{weekSummary.plannedTotal}</strong>
            <span>Comidas planificadas</span>
          </div>
          <div className="counter-chip counter-chip--pending">
            <strong>{weekSummary.loggedTotal}</strong>
            <span>Comidas registradas</span>
          </div>
          <div className="counter-chip counter-chip--neutral">
            <strong>{weekSummary.daysWithActivity}/7</strong>
            <span>Días con actividad</span>
          </div>
        </div>
      </section>

      <section className="history-compact-bar">
        <div className="history-week-nav">
          <button
            type="button"
            className="icon-button"
            aria-label="Semana anterior"
            onClick={() => changeWeek(selectedOffset - 1)}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="history-current-range">
            <CalendarDays size={16} />
            <strong>{getWeekLabel(selectedOffset)}</strong>
            <span>· {formatRange(selectedWeekStart)}</span>
          </div>

          <button
            type="button"
            className="icon-button"
            aria-label="Semana siguiente"
            disabled={selectedOffset >= 0}
            onClick={() => changeWeek(selectedOffset + 1)}
          >
            <ChevronRight size={18} />
          </button>

          {selectedOffset < 0 && (
            <button
              type="button"
              className="today-button"
              onClick={() => changeWeek(0)}
            >
              Volver a hoy
            </button>
          )}
        </div>

        <div className="history-quick-select">
          <label htmlFor="history-week-select">Ir a:</label>
          <select
            id="history-week-select"
            className="history-select-input"
            value={selectedOffset}
            onChange={(e) => changeWeek(Number(e.target.value))}
          >
            {historyOffsets.map((offset) => {
              const start = addDays(currentMonday, offset * 7)
              return (
                <option key={offset} value={offset}>
                  {getWeekLabel(offset)} ({formatRange(start)})
                </option>
              )
            })}
          </select>
        </div>
      </section>

      <section className="panel history-chart-panel">
        <div className="history-chart-header">
          <div>
            <span className="panel-kicker">COMPARACIÓN VISUAL</span>
            <h2>Actividad de la semana</h2>
          </div>

          <div className="history-chart-legend" aria-label="Leyenda del gráfico">
            <span className="legend-item">
              <i className="legend-dot legend-dot--planned" /> Planificadas
            </span>
            <span className="legend-item">
              <i className="legend-dot legend-dot--logged" /> Registradas
            </span>
          </div>
        </div>

        {weekSummary.isEmpty ? (
          <div className="history-chart-empty">
            <span className="history-chart-empty-icon">✿</span>
            <strong>Esta semana todavía no tiene comidas cargadas</strong>
            <p>
              Cuando planifiques tu menú o registres lo que comiste en estos días, vas a ver acá la comparación diaria.
            </p>
          </div>
        ) : (
          <div className="history-chart-bars" role="img" aria-label="Gráfico comparativo de comidas planificadas y registradas por día">
            {daysData.map((day) => {
              const plannedPct = (day.plannedCount / 4) * 100
              const loggedPct = (day.loggedCount / 4) * 100
              const isExpanded = expandedDay === day.idx

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  className={`chart-day-col ${isExpanded ? 'chart-day-col--active' : ''}`}
                  onClick={() => setExpandedDay(isExpanded ? null : day.idx)}
                  title={`${day.fullName}: ${day.plannedCount} planificadas, ${day.loggedCount} registradas`}
                >
                  <div className="chart-day-values">
                    <span className="chart-val chart-val--plan">{day.plannedCount}</span>
                    <span className="chart-val-sep">/</span>
                    <span className="chart-val chart-val--real">{day.loggedCount}</span>
                  </div>

                  <div className="chart-bars-pair">
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill chart-bar-fill--planned"
                        style={{ height: `${plannedPct}%` }}
                      />
                    </div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill chart-bar-fill--logged"
                        style={{ height: `${loggedPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="chart-day-label">
                    <strong>{day.shortName}</strong>
                    <span>{day.date.getDate()}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <section className="history-days-section">
        <div className="history-section-heading">
          <div>
            <span className="panel-kicker">DETALLE DIARIO</span>
            <h2>Los 7 días de la semana</h2>
          </div>
          <p className="history-section-hint">
            Tocá cualquier día para desplegar sus 4 comidas y observaciones.
          </p>
        </div>

        <div className="history-cards-grid">
          {daysData.map((day) => {
            const isExpanded = expandedDay === day.idx

            return (
              <article
                key={day.dateKey}
                className={`history-compact-card ${
                  day.hasActivity ? 'history-compact-card--has-data' : ''
                } ${isExpanded ? 'history-compact-card--expanded' : ''}`}
              >
                <button
                  type="button"
                  className="history-card-trigger"
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedDay(isExpanded ? null : day.idx)}
                >
                  <div className="history-card-top">
                    <div className="history-card-date">
                      <strong>{day.fullName}</strong>
                      <span>
                        {day.date.getDate()} de {MONTH_NAMES[day.date.getMonth()].slice(0, 3)}
                      </span>
                    </div>

                    <div className="history-card-badges">
                      {day.hasActivity ? (
                        <>
                          <span className="history-mini-badge history-mini-badge--plan">
                            Plan {day.plannedCount}/4
                          </span>
                          <span className="history-mini-badge history-mini-badge--real">
                            Real {day.loggedCount}/4
                          </span>
                        </>
                      ) : (
                        <span className="history-mini-badge history-mini-badge--empty">
                          Sin actividad
                        </span>
                      )}
                      <ChevronDown
                        size={16}
                        className={`history-chevron ${isExpanded ? 'history-chevron--open' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="history-card-preview">
                    {MEAL_SLOTS.map((slot) => {
                      const hasPlan = Boolean(day.planned[slot.id]?.trim())
                      const hasReal = Boolean(day.actual[slot.id]?.trim())
                      const display =
                        day.actual[slot.id]?.trim() || day.planned[slot.id]?.trim() || ''

                      return (
                        <div
                          key={slot.id}
                          className={`preview-slot-chip ${
                            hasReal
                              ? 'preview-slot-chip--real'
                              : hasPlan
                                ? 'preview-slot-chip--plan'
                                : 'preview-slot-chip--none'
                          }`}
                        >
                          <span className="preview-slot-label">{slot.name.slice(0, 3)}</span>
                          <span className="preview-slot-text">
                            {display || '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </button>

                {isExpanded && (
                  <div className="history-card-Accordion">
                    <div className="history-expanded-slots">
                      {MEAL_SLOTS.map(({ id, name, icon: Icon, tone }) => {
                        const plannedText = day.planned[id]?.trim() || ''
                        const actualText = day.actual[id]?.trim() || ''

                        return (
                          <div key={id} className="history-expanded-slot">
                            <div className="history-expanded-slot-head">
                              <div className={`meal-icon history-slot-icon ${tone}`}>
                                <Icon size={15} strokeWidth={1.8} />
                              </div>
                              <strong>{name}</strong>
                            </div>

                            <div className="history-expanded-lines">
                              <div className="history-line">
                                <span className="planned-ref-badge">Plan</span>
                                <span className={plannedText ? 'history-line-val' : 'history-line-empty'}>
                                  {plannedText || 'Sin planificar'}
                                </span>
                              </div>
                              <div className="history-line">
                                <span className="actual-badge">Comí</span>
                                <span className={actualText ? 'history-line-val' : 'history-line-empty'}>
                                  {actualText || 'Sin registrar'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {day.notes && (
                      <div className="history-day-notes">
                        <MessageSquareHeart size={14} />
                        <div>
                          <strong>Observaciones:</strong>
                          <p>{day.notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="history-expanded-actions">
                      <button
                        type="button"
                        className="slot-action-btn"
                        onClick={() => onNavigateToDay('menu', selectedOffset, day.idx)}
                      >
                        Editar menú planificado
                      </button>
                      <button
                        type="button"
                        className="slot-action-btn"
                        onClick={() => onNavigateToDay('registro', selectedOffset, day.idx)}
                      >
                        Ir a Lo que comí
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel history-shopping-footer">
        <div className="history-shopping-footer-main">
          <div className="shopping-heading-icon">
            <ShoppingBasket size={18} />
          </div>
          <div className="history-shopping-footer-copy">
            <div className="history-shopping-footer-title">
              <strong>Resumen de lista de compras</strong>
              <span className="history-shopping-counts">
                {checkedShopping} comprados · {pendingShopping} pendientes
              </span>
            </div>
            <p className="history-shopping-disclaimer">
              <Info size={13} /> Lista actual de la aplicación (todavía no se guardan listas independientes por semana).
            </p>
          </div>
          <button
            type="button"
            className="text-button history-shopping-link"
            onClick={() => onNavigateSection('compras')}
          >
            Ver lista <ArrowRight size={15} />
          </button>
        </div>

        {pendingPreview.length > 0 && (
          <div className="history-shopping-pills">
            <span className="history-pills-label">Pendientes:</span>
            {pendingPreview.map((item) => (
              <span key={item.id} className="overview-meal-pill">
                <strong>{item.name}</strong> ({formatItemAmount(item)})
              </span>
            ))}
            {pendingShopping > pendingPreview.length && (
              <span className="shopping-more-hint">
                +{pendingShopping - pendingPreview.length} más
              </span>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, CirclePlus, Clock3, ShoppingBasket, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import MealCard from '../components/MealCard'
import type { Section } from '../components/Sidebar'
import {
  WEEKDAY_NAMES,
  addDays,
  countDayMeals,
  formatRange,
  mondayOf,
  toDateKey,
} from '../lib/mealsStorage'
import type { MealSlot, PlannedMealsMap } from '../lib/mealsStorage'
import { formatItemAmount } from '../lib/shoppingStorage'
import type { ShoppingItem } from '../lib/shoppingStorage'

type DashboardProps = {
  onNavigate: (section: Section) => void
  onNavigateToMealSlot: (slot: MealSlot) => void
  weekOffset: number
  onChangeWeekOffset: (updater: number | ((prev: number) => number)) => void
  selectedDay: number
  onChangeSelectedDay: (dayIndex: number) => void
  plannedMeals: PlannedMealsMap
  shoppingItems: ShoppingItem[]
  onToggleShoppingItem: (id: string) => void
}

export default function Dashboard({
  onNavigate,
  onNavigateToMealSlot,
  weekOffset,
  onChangeWeekOffset,
  selectedDay,
  onChangeSelectedDay,
  plannedMeals,
  shoppingItems,
  onToggleShoppingItem,
}: DashboardProps) {
  const weekStart = useMemo(() => {
    const monday = mondayOf(new Date())
    monday.setDate(monday.getDate() + weekOffset * 7)
    return monday
  }, [weekOffset])
  const today = new Date()
  const currentWeek = weekOffset === 0

  const selectedDate = addDays(weekStart, selectedDay)
  const selectedDateKey = toDateKey(selectedDate)
  const selectedDayMeals = plannedMeals[selectedDateKey]

  const totalShopping = shoppingItems.length
  const checkedShopping = shoppingItems.filter((item) => item.checked).length
  const pendingShopping = totalShopping - checkedShopping
  const previewShoppingItems = shoppingItems.slice(0, 4)

  return (
    <div className="dashboard-page">
      <section className="welcome-row">
        <div>
          <div className="eyebrow"><Sparkles size={14} /> TU ESPACIO, TU RITMO</div>
          <h1>¡Hola! <span className="wave">✳</span></h1>
          <p className="welcome-subtitle">Un poquito de organización para una semana más tranquila.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate('menu')}><CirclePlus size={18} /> Planificar semana</button>
      </section>

      <section className="week-toolbar">
        <div className="week-title"><div className="section-icon"><CalendarDays size={19} /></div><div><h2>Tu semana</h2><p>{formatRange(weekStart)}</p></div></div>
        <div className="week-controls"><button className="icon-button" aria-label="Semana anterior" onClick={() => onChangeWeekOffset((v) => v - 1)}><ChevronLeft size={19} /></button><button className="today-button" onClick={() => onChangeWeekOffset(0)}>Esta semana</button><button className="icon-button" aria-label="Semana siguiente" onClick={() => onChangeWeekOffset((v) => v + 1)}><ChevronRight size={19} /></button></div>
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
              className={`day-button ${selectedDay === index ? 'day-button--selected' : ''} ${isToday ? 'day-button--today' : ''}`}
              onClick={() => onChangeSelectedDay(index)}
            >
              <span>{day}</span>
              <strong>{date.getDate()}</strong>
              {count > 0 ? <small className="day-meal-count">{count}/4</small> : isToday && <i />}
            </button>
          )
        })}
      </section>

      <div className="content-grid">
        <section className="panel meals-panel">
          <div className="panel-heading"><div><span className="panel-kicker">TU PLAN</span><h2>Comidas del día</h2></div><span className="date-pill">{WEEKDAY_NAMES[selectedDay]} {selectedDate.getDate()}</span></div>
          <p className="panel-description">Todo puede cambiar. Este es tu punto de partida.</p>
          <MealCard dayMeals={selectedDayMeals} onSelectSlot={onNavigateToMealSlot} />
          <button className="text-button" onClick={() => onNavigate('menu')}>Completar menú del día <ArrowRight size={16} /></button>
        </section>

        <section className="panel shopping-panel">
          <div className="panel-heading"><div className="shopping-heading-icon"><ShoppingBasket size={19} /></div><div><span className="panel-kicker">PARA TENER A MANO</span><h2>Lista de compras</h2></div></div>
          <p className="panel-description">Un adelanto de lo que necesitás.</p>
          {totalShopping > 0 ? (
            <>
              <div className="shopping-progress">
                <span>
                  {checkedShopping} de {totalShopping} comprados · {pendingShopping}{' '}
                  {pendingShopping === 1 ? 'pendiente' : 'pendientes'}
                </span>
                <div className="progress-track">
                  <div style={{ width: `${(checkedShopping / totalShopping) * 100}%` }} />
                </div>
              </div>
              <div className="shopping-items">
                {previewShoppingItems.map((item) => (
                  <button
                    key={item.id}
                    className={`shopping-item ${item.checked ? 'shopping-item--checked' : ''}`}
                    onClick={() => onToggleShoppingItem(item.id)}
                  >
                    <span className="check-box">{item.checked && <Check size={13} />}</span>
                    <span className="shopping-item-copy">
                      <strong>{item.name}</strong>
                      <small>{formatItemAmount(item)}</small>
                    </span>
                    <span className="category-label">{item.category}</span>
                  </button>
                ))}
              </div>
              {totalShopping > previewShoppingItems.length && (
                <p className="shopping-more-hint">
                  +{totalShopping - previewShoppingItems.length} más en tu lista completa
                </p>
              )}
            </>
          ) : (
            <div className="dashboard-shopping-empty">
              <span>Tu lista de compras está vacía por ahora.</span>
            </div>
          )}
          <button className="text-button" onClick={() => onNavigate('compras')}>Ver lista completa <ArrowRight size={16} /></button>
        </section>
      </div>

      <section className="bottom-banner"><div className="banner-flower">✿</div><div><strong>Planificar también es cuidarte.</strong><p>No necesitás resolver toda la semana hoy. Empezá por una comida.</p></div><div className="banner-side-note"><Clock3 size={16} /> A tu ritmo</div></section>
      <p className="demo-note">Tus comidas planificadas y tu lista de compras se guardan automáticamente en este dispositivo.</p>
    </div>
  )
}



import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, CirclePlus, Clock3, ShoppingBasket, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import MealCard from '../components/MealCard'
import type { Section } from '../components/Sidebar'

type DashboardProps = { onNavigate: (section: Section) => void }

const weekdayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function mondayOf(date: Date) {
  const result = new Date(date)
  const day = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - day)
  result.setHours(0, 0, 0, 0)
  return result
}
function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
function formatRange(start: Date) {
  const end = addDays(start, 6)
  if (start.getMonth() === end.getMonth()) return `${start.getDate()} – ${end.getDate()} de ${monthNames[end.getMonth()]}`
  return `${start.getDate()} ${monthNames[start.getMonth()].slice(0, 3)} – ${end.getDate()} ${monthNames[end.getMonth()].slice(0, 3)}`
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const weekStart = useMemo(() => {
    const monday = mondayOf(new Date())
    monday.setDate(monday.getDate() + weekOffset * 7)
    return monday
  }, [weekOffset])
  const today = new Date()
  const currentWeek = weekOffset === 0
  const shoppingItems = [
    { name: 'Leche', amount: '1 litro', category: 'Lácteos' },
    { name: 'Huevos', amount: '6 unidades', category: 'Almacén' },
    { name: 'Arroz', amount: '500 g', category: 'Almacén' },
  ]

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
        <div className="week-controls"><button className="icon-button" aria-label="Semana anterior" onClick={() => setWeekOffset((v) => v - 1)}><ChevronLeft size={19} /></button><button className="today-button" onClick={() => setWeekOffset(0)}>Esta semana</button><button className="icon-button" aria-label="Semana siguiente" onClick={() => setWeekOffset((v) => v + 1)}><ChevronRight size={19} /></button></div>
      </section>

      <section className="day-strip" aria-label="Elegir día">
        {weekdayNames.map((day, index) => {
          const date = addDays(weekStart, index)
          const isToday = currentWeek && date.toDateString() === today.toDateString()
          return <button key={day} className={`day-button ${selectedDay === index ? 'day-button--selected' : ''} ${isToday ? 'day-button--today' : ''}`} onClick={() => setSelectedDay(index)}><span>{day}</span><strong>{date.getDate()}</strong>{isToday && <i />}</button>
        })}
      </section>

      <div className="content-grid">
        <section className="panel meals-panel">
          <div className="panel-heading"><div><span className="panel-kicker">TU PLAN</span><h2>Comidas del día</h2></div><span className="date-pill">{weekdayNames[selectedDay]} {addDays(weekStart, selectedDay).getDate()}</span></div>
          <p className="panel-description">Todo puede cambiar. Este es tu punto de partida.</p>
          <MealCard />
          <button className="text-button" onClick={() => onNavigate('menu')}>Completar menú del día <ArrowRight size={16} /></button>
        </section>

        <section className="panel shopping-panel">
          <div className="panel-heading"><div className="shopping-heading-icon"><ShoppingBasket size={19} /></div><div><span className="panel-kicker">PARA TENER A MANO</span><h2>Lista de compras</h2></div></div>
          <p className="panel-description">Un adelanto de lo que necesitás.</p>
          <div className="shopping-progress"><span>{checkedItems.length} de {shoppingItems.length} comprados</span><div className="progress-track"><div style={{ width: `${checkedItems.length / shoppingItems.length * 100}%` }} /></div></div>
          <div className="shopping-items">{shoppingItems.map((item) => { const checked = checkedItems.includes(item.name); return <button key={item.name} className={`shopping-item ${checked ? 'shopping-item--checked' : ''}`} onClick={() => setCheckedItems((prev) => checked ? prev.filter((name) => name !== item.name) : [...prev, item.name])}><span className="check-box">{checked && <Check size={13} />}</span><span className="shopping-item-copy"><strong>{item.name}</strong><small>{item.amount}</small></span><span className="category-label">{item.category}</span></button> })}</div>
          <button className="text-button" onClick={() => onNavigate('compras')}>Ver lista completa <ArrowRight size={16} /></button>
        </section>
      </div>

      <section className="bottom-banner"><div className="banner-flower">✿</div><div><strong>Planificar también es cuidarte.</strong><p>No necesitás resolver toda la semana hoy. Empezá por una comida.</p></div><div className="banner-side-note"><Clock3 size={16} /> A tu ritmo</div></section>
      <p className="demo-note">Vista inicial de demostración · Los cambios de esta pantalla todavía no se guardan en la base de datos.</p>
    </div>
  )
}

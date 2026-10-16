import { CalendarDays, ClipboardList, CookingPot, History, Leaf, ShoppingBasket, Utensils, X } from 'lucide-react'

export type Section = 'inicio' | 'menu' | 'compras' | 'registro' | 'historial'

type SidebarProps = {
  active: Section
  onChange: (section: Section) => void
  mobileOpen: boolean
  onClose: () => void
  hasPendingShopping?: boolean
}

const links: { id: Section; label: string; icon: typeof CalendarDays }[] = [
  { id: 'inicio', label: 'Inicio', icon: CookingPot },
  { id: 'menu', label: 'Menú semanal', icon: CalendarDays },
  { id: 'compras', label: 'Lista de compras', icon: ShoppingBasket },
  { id: 'registro', label: 'Lo que comí', icon: ClipboardList },
  { id: 'historial', label: 'Historial', icon: History },
]

export default function Sidebar({ active, onChange, mobileOpen, onClose, hasPendingShopping = true }: SidebarProps) {
  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" aria-label="Cerrar menú" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Utensils size={21} /></div>
          <div className="brand-copy"><strong>mi menú</strong><span>semanal</span></div>
          <button className="icon-button mobile-close" aria-label="Cerrar menú" onClick={onClose}><X size={19} /></button>
        </div>
        <div className="sidebar-caption">ORGANIZACIÓN</div>
        <nav className="side-nav" aria-label="Navegación principal">
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${active === id ? 'nav-link--active' : ''}`} onClick={() => { onChange(id); onClose() }}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>{id === 'compras' && hasPendingShopping && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="note-icon"><Leaf size={18} /></div>
          <strong>Un día a la vez</strong>
          <p>No hace falta que salga perfecto. Lo importante es encontrar lo que te funciona.</p>
          <span className="note-sparkle">✳</span>
        </div>
        <div className="sidebar-footer"><span className="status-dot" /> Tus comidas, a tu manera</div>
      </aside>
    </>
  )
}

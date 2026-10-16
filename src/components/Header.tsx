import { Bell, Menu, Search } from 'lucide-react'
import type { Section } from './Sidebar'

type HeaderProps = {
  active: Section
  onMenuClick: () => void
}

const sectionTitles: Record<Section, string> = {
  inicio: 'Inicio',
  menu: 'Menú semanal',
  compras: 'Lista de compras',
  registro: 'Lo que comí',
  historial: 'Historial',
}

export default function Header({ active, onMenuClick }: HeaderProps) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" aria-label="Abrir menú" onClick={onMenuClick}><Menu size={21} /></button>
      <div className="breadcrumb"><span>Mi espacio</span><span className="breadcrumb-slash">/</span><strong>{sectionTitles[active]}</strong></div>
      <div className="topbar-actions">
        <button className="search-button" aria-label="Buscar" onClick={() => window.alert('La búsqueda estará disponible en una próxima etapa.')}><Search size={17} /><span>Buscar...</span><kbd>⌘ K</kbd></button>
        <button className="icon-button notification-button" aria-label="Notificaciones" onClick={() => window.alert('Todavía no tenés notificaciones.')}><Bell size={19} /></button>
        <div className="avatar" aria-label="Perfil de usuario">M</div>
      </div>
    </header>
  )
}


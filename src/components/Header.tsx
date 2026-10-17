import { Bell, Menu, Moon, Search, Sun } from 'lucide-react'
import type { ThemeMode } from '../lib/themeStorage'
import type { Section } from './Sidebar'

type HeaderProps = {
  active: Section
  onMenuClick: () => void
  theme: ThemeMode
  onToggleTheme: () => void
}

const sectionTitles: Record<Section, string> = {
  inicio: 'Inicio',
  menu: 'Menú semanal',
  compras: 'Lista de compras',
  registro: 'Lo que comí',
  historial: 'Historial',
}

export default function Header({ active, onMenuClick, theme, onToggleTheme }: HeaderProps) {
  const isDark = theme === 'dark'

  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" aria-label="Abrir menú" onClick={onMenuClick}>
        <Menu size={21} />
      </button>
      <div className="breadcrumb">
        <span>Mi espacio</span>
        <span className="breadcrumb-slash">/</span>
        <strong>{sectionTitles[active]}</strong>
      </div>
      <div className="topbar-actions">
        <button
          className="search-button"
          aria-label="Buscar"
          onClick={() => window.alert('La búsqueda estará disponible en una próxima etapa.')}
        >
          <Search size={17} />
          <span>Buscar...</span>
          <kbd>⌘ K</kbd>
        </button>

        <button
          type="button"
          className="theme-toggle-button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-pressed={isDark}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
          <span className="theme-toggle-label">{isDark ? 'Claro' : 'Oscuro'}</span>
        </button>

        <button
          className="icon-button notification-button"
          aria-label="Notificaciones"
          onClick={() => window.alert('Todavía no tenés notificaciones.')}
        >
          <Bell size={19} />
        </button>
        <div className="avatar" aria-label="Perfil de usuario">
          M
        </div>
      </div>
    </header>
  )
}



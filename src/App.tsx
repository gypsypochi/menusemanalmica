import { useState } from 'react'
import { CalendarDays, ClipboardList, CookingPot, History, ShoppingBasket, Utensils } from 'lucide-react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import type { Section } from './components/Sidebar'
import Dashboard from './pages/Dashboard'

const sectionDetails: Record<Exclude<Section, 'inicio'>, { title: string; subtitle: string; icon: typeof CalendarDays }> = {
  menu: { title: 'Menú semanal', subtitle: 'Pensá tus comidas con tiempo, sin exigirte de más.', icon: CalendarDays },
  compras: { title: 'Lista de compras', subtitle: 'Anotá lo que necesitás y marcá lo que ya conseguiste.', icon: ShoppingBasket },
  registro: { title: 'Lo que comí', subtitle: 'Registrá tus comidas reales, sin importar si cambiaron los planes.', icon: ClipboardList },
  historial: { title: 'Historial', subtitle: 'Tus semanas anteriores, para aprender de tu propia rutina.', icon: History },
}

export default function App() {
  const [active, setActive] = useState<Section>('inicio')
  const [mobileOpen, setMobileOpen] = useState(false)
  const changeSection = (section: Section) => setActive(section)

  return (
    <div className="app-shell">
      <Sidebar active={active} onChange={changeSection} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-area">
        <Header onMenuClick={() => setMobileOpen(true)} />
        {active === 'inicio' ? <Dashboard onNavigate={changeSection} /> : <PlaceholderPage section={active} onBack={() => setActive('inicio')} />}
      </main>
    </div>
  )
}

function PlaceholderPage({ section, onBack }: { section: Exclude<Section, 'inicio'>; onBack: () => void }) {
  const details = sectionDetails[section]
  const Icon = details.icon
  return <section className="placeholder-page"><div className="placeholder-art"><div className="placeholder-art-inner"><Icon size={42} strokeWidth={1.4} /><Utensils className="placeholder-utensils" size={21} /></div></div><span className="panel-kicker">PRÓXIMO PASO</span><h1>{details.title}</h1><p>{details.subtitle}</p><div className="coming-soon"><span className="coming-soon-dot" /> Esta sección la vamos a construir juntas.</div><button className="primary-button" onClick={onBack}><CookingPot size={17} /> Volver al inicio</button></section>
}

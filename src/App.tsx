import { useEffect, useState } from 'react'
import { CalendarDays, ClipboardList, CookingPot, History, Utensils } from 'lucide-react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import type { Section } from './components/Sidebar'
import { loadPlannedMeals, savePlannedMeals } from './lib/mealsStorage'
import type { MealSlot, PlannedMealsMap } from './lib/mealsStorage'
import { loadShoppingItems, saveShoppingItems } from './lib/shoppingStorage'
import type { ShoppingItem } from './lib/shoppingStorage'
import Dashboard from './pages/Dashboard'
import ShoppingList from './pages/ShoppingList'
import WeeklyMenu from './pages/WeeklyMenu'

const sectionDetails: Record<Exclude<Section, 'inicio' | 'menu' | 'compras'>, { title: string; subtitle: string; icon: typeof CalendarDays }> = {
  registro: { title: 'Lo que comí', subtitle: 'Registrá tus comidas reales, sin importar si cambiaron los planes.', icon: ClipboardList },
  historial: { title: 'Historial', subtitle: 'Tus semanas anteriores, para aprender de tu propia rutina.', icon: History },
}

export default function App() {
  const [active, setActive] = useState<Section>('inicio')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
  const [plannedMeals, setPlannedMeals] = useState<PlannedMealsMap>(() => loadPlannedMeals())
  const [initialEditingSlot, setInitialEditingSlot] = useState<MealSlot | null>(null)
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => loadShoppingItems())

  useEffect(() => {
    savePlannedMeals(plannedMeals)
  }, [plannedMeals])

  useEffect(() => {
    saveShoppingItems(shoppingItems)
  }, [shoppingItems])

  const changeSection = (section: Section) => setActive(section)

  const handleSaveMeal = (dateKey: string, slot: MealSlot, value: string) => {
    setPlannedMeals((prev) => {
      const existingDay = prev[dateKey] || {}
      return {
        ...prev,
        [dateKey]: {
          ...existingDay,
          [slot]: value,
        },
      }
    })
  }

  const handleDeleteMeal = (dateKey: string, slot: MealSlot) => {
    setPlannedMeals((prev) => {
      const existingDay = prev[dateKey]
      if (!existingDay) return prev
      const updatedDay = { ...existingDay }
      delete updatedDay[slot]
      const next = { ...prev }
      if (Object.keys(updatedDay).length === 0) {
        delete next[dateKey]
      } else {
        next[dateKey] = updatedDay
      }
      return next
    })
  }

  const handleClearDayMeals = (dateKey: string) => {
    setPlannedMeals((prev) => {
      if (!prev[dateKey]) return prev
      const next = { ...prev }
      delete next[dateKey]
      return next
    })
  }

  const handleNavigateToMealSlot = (slot: MealSlot) => {
    setInitialEditingSlot(slot)
    setActive('menu')
  }

  const handleAddShoppingItem = (
    data: Omit<ShoppingItem, 'id' | 'checked'>,
  ): { ok: boolean; error?: string } => {
    const cleanName = data.name.trim()
    if (!cleanName) {
      return { ok: false, error: 'Escribí el nombre del producto antes de agregarlo.' }
    }
    const normalized = cleanName.toLowerCase()
    const duplicate = shoppingItems.some((item) => item.name.trim().toLowerCase() === normalized)
    if (duplicate) {
      return { ok: false, error: `«${cleanName}» ya está en tu lista de compras.` }
    }
    const newItem: ShoppingItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      quantity: data.quantity.trim(),
      unit: data.unit.trim(),
      category: data.category,
      checked: false,
    }
    setShoppingItems((prev) => [newItem, ...prev])
    return { ok: true }
  }

  const handleUpdateShoppingItem = (
    id: string,
    data: Omit<ShoppingItem, 'id' | 'checked'>,
  ): { ok: boolean; error?: string } => {
    const cleanName = data.name.trim()
    if (!cleanName) {
      return { ok: false, error: 'El nombre del producto no puede quedar vacío.' }
    }
    const normalized = cleanName.toLowerCase()
    const duplicate = shoppingItems.some(
      (item) => item.id !== id && item.name.trim().toLowerCase() === normalized,
    )
    if (duplicate) {
      return { ok: false, error: `Ya tenés otro producto llamado «${cleanName}» en la lista.` }
    }
    setShoppingItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              name: cleanName,
              quantity: data.quantity.trim(),
              unit: data.unit.trim(),
              category: data.category,
            }
          : item,
      ),
    )
    return { ok: true }
  }

  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    )
  }

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAllShopping = () => {
    setShoppingItems([])
  }

  const handleClearCheckedShopping = () => {
    setShoppingItems((prev) => prev.filter((item) => !item.checked))
  }

  const hasPendingShopping = shoppingItems.some((item) => !item.checked)

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onChange={changeSection}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        hasPendingShopping={hasPendingShopping}
      />
      <main className="main-area">
        <Header active={active} onMenuClick={() => setMobileOpen(true)} />
        {active === 'inicio' ? (
          <Dashboard
            onNavigate={changeSection}
            onNavigateToMealSlot={handleNavigateToMealSlot}
            weekOffset={weekOffset}
            onChangeWeekOffset={setWeekOffset}
            selectedDay={selectedDay}
            onChangeSelectedDay={setSelectedDay}
            plannedMeals={plannedMeals}
            shoppingItems={shoppingItems}
            onToggleShoppingItem={handleToggleShoppingItem}
          />
        ) : active === 'menu' ? (
          <WeeklyMenu
            weekOffset={weekOffset}
            onChangeWeekOffset={setWeekOffset}
            selectedDay={selectedDay}
            onChangeSelectedDay={setSelectedDay}
            plannedMeals={plannedMeals}
            onSaveMeal={handleSaveMeal}
            onDeleteMeal={handleDeleteMeal}
            onClearDayMeals={handleClearDayMeals}
            initialEditingSlot={initialEditingSlot}
            onClearInitialEditingSlot={() => setInitialEditingSlot(null)}
          />
        ) : active === 'compras' ? (
          <ShoppingList
            items={shoppingItems}
            onAddItem={handleAddShoppingItem}
            onUpdateItem={handleUpdateShoppingItem}
            onToggleItem={handleToggleShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onClearAll={handleClearAllShopping}
            onClearChecked={handleClearCheckedShopping}
          />
        ) : (
          <PlaceholderPage section={active} onBack={() => setActive('inicio')} />
        )}
      </main>
    </div>
  )
}

function PlaceholderPage({ section, onBack }: { section: Exclude<Section, 'inicio' | 'menu' | 'compras'>; onBack: () => void }) {
  const details = sectionDetails[section]
  const Icon = details.icon
  return <section className="placeholder-page"><div className="placeholder-art"><div className="placeholder-art-inner"><Icon size={42} strokeWidth={1.4} /><Utensils className="placeholder-utensils" size={21} /></div></div><span className="panel-kicker">PRÓXIMO PASO</span><h1>{details.title}</h1><p>{details.subtitle}</p><div className="coming-soon"><span className="coming-soon-dot" /> Esta sección la vamos a construir juntas.</div><button className="primary-button" onClick={onBack}><CookingPot size={17} /> Volver al inicio</button></section>
}



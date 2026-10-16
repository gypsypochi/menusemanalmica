export const SHOPPING_CATEGORIES = [
  'Carnes',
  'Lácteos',
  'Verdulería',
  'Frutas',
  'Almacén',
  'Sin TACC',
  'Limpieza',
  'Otros',
] as const

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number]

export type ShoppingStatusFilter = 'todos' | 'pendientes' | 'comprados'

export type ShoppingItem = {
  id: string
  name: string
  quantity: string
  unit: string
  category: ShoppingCategory
  checked: boolean
}

const SHOPPING_STORAGE_KEY = 'menu_semanal_shopping_list_v1'

const DEFAULT_SHOPPING_ITEMS: ShoppingItem[] = [
  { id: 'default-1', name: 'Leche', quantity: '1', unit: 'litro', category: 'Lácteos', checked: false },
  { id: 'default-2', name: 'Huevos', quantity: '6', unit: 'unidades', category: 'Almacén', checked: false },
  { id: 'default-3', name: 'Arroz', quantity: '500', unit: 'g', category: 'Almacén', checked: false },
]

function isValidCategory(value: unknown): value is ShoppingCategory {
  return typeof value === 'string' && (SHOPPING_CATEGORIES as readonly string[]).includes(value)
}

function sanitizeShoppingItem(raw: unknown): ShoppingItem | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const name = typeof obj.name === 'string' ? obj.name.trim() : ''
  if (!name) return null

  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id : `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const quantity = typeof obj.quantity === 'string' ? obj.quantity.trim() : ''
  const unit = typeof obj.unit === 'string' ? obj.unit.trim() : ''
  const category: ShoppingCategory = isValidCategory(obj.category) ? obj.category : 'Otros'
  const checked = Boolean(obj.checked)

  return { id, name, quantity, unit, category, checked }
}

export function loadShoppingItems(): ShoppingItem[] {
  try {
    const raw = window.localStorage.getItem(SHOPPING_STORAGE_KEY)
    if (raw === null) {
      return DEFAULT_SHOPPING_ITEMS
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return DEFAULT_SHOPPING_ITEMS
    }
    const validItems: ShoppingItem[] = []
    for (const entry of parsed) {
      const sanitized = sanitizeShoppingItem(entry)
      if (sanitized) validItems.push(sanitized)
    }
    return validItems
  } catch {
    return DEFAULT_SHOPPING_ITEMS
  }
}

export function saveShoppingItems(items: ShoppingItem[]): void {
  try {
    window.localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignorar errores de almacenamiento si el navegador restringe localStorage
  }
}

export function formatItemAmount(item: Pick<ShoppingItem, 'quantity' | 'unit'>): string {
  const q = item.quantity.trim()
  const u = item.unit.trim()
  if (q && u) return `${q} ${u}`
  if (q) return q
  if (u) return u
  return 'Cantidad opcional'
}

import {
  Check,
  Pencil,
  Plus,
  ShoppingBasket,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  SHOPPING_CATEGORIES,
  formatItemAmount,
} from '../lib/shoppingStorage'
import type {
  ShoppingCategory,
  ShoppingItem,
  ShoppingStatusFilter,
} from '../lib/shoppingStorage'

type ShoppingListProps = {
  items: ShoppingItem[]
  onAddItem: (data: Omit<ShoppingItem, 'id' | 'checked'>) => { ok: boolean; error?: string }
  onUpdateItem: (id: string, data: Omit<ShoppingItem, 'id' | 'checked'>) => { ok: boolean; error?: string }
  onToggleItem: (id: string) => void
  onDeleteItem: (id: string) => void
  onClearAll: () => void
  onClearChecked: () => void
}

export default function ShoppingList({
  items,
  onAddItem,
  onUpdateItem,
  onToggleItem,
  onDeleteItem,
  onClearAll,
  onClearChecked,
}: ShoppingListProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState<ShoppingCategory>('Almacén')
  const [formError, setFormError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<ShoppingStatusFilter>('todos')
  const [categoryFilter, setCategoryFilter] = useState<ShoppingCategory | 'Todas'>('Todas')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('')
  const [editUnit, setEditUnit] = useState('')
  const [editCategory, setEditCategory] = useState<ShoppingCategory>('Almacén')
  const [editError, setEditError] = useState<string | null>(null)

  const [confirmClearAll, setConfirmClearAll] = useState(false)

  const totalCount = items.length
  const checkedCount = useMemo(() => items.filter((i) => i.checked).length, [items])
  const pendingCount = totalCount - checkedCount

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'pendientes' && item.checked) return false
      if (statusFilter === 'comprados' && !item.checked) return false
      if (categoryFilter !== 'Todas' && item.category !== categoryFilter) return false
      return true
    })
  }, [items, statusFilter, categoryFilter])

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const result = onAddItem({
      name,
      quantity,
      unit,
      category,
    })
    if (!result.ok) {
      setFormError(result.error || 'Revisá el nombre del producto.')
      return
    }
    setName('')
    setQuantity('')
    setUnit('')
  }

  const startEdit = (item: ShoppingItem) => {
    setEditingId(item.id)
    setEditName(item.name)
    setEditQuantity(item.quantity)
    setEditUnit(item.unit)
    setEditCategory(item.category)
    setEditError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditError(null)
  }

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault()
    setEditError(null)
    const result = onUpdateItem(id, {
      name: editName,
      quantity: editQuantity,
      unit: editUnit,
      category: editCategory,
    })
    if (!result.ok) {
      setEditError(result.error || 'Revisá los datos del producto.')
      return
    }
    setEditingId(null)
  }

  return (
    <div className="dashboard-page">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} /> COMPRAS ORGANIZADAS
          </div>
          <h1>Lista de compras</h1>
          <p className="welcome-subtitle">
            Anotá lo que necesitás y marcá lo que ya conseguiste, a tu ritmo.
          </p>
        </div>

        <div className="shopping-counters">
          <div className="counter-chip counter-chip--pending">
            <strong>{pendingCount}</strong>
            <span>{pendingCount === 1 ? 'pendiente' : 'pendientes'}</span>
          </div>
          <div className="counter-chip counter-chip--checked">
            <strong>{checkedCount}</strong>
            <span>{checkedCount === 1 ? 'comprado' : 'comprados'}</span>
          </div>
        </div>
      </section>

      <div className="shopping-layout-grid">
        <section className="panel shopping-form-panel">
          <div className="panel-heading">
            <div className="shopping-heading-icon">
              <ShoppingBasket size={19} />
            </div>
            <div>
              <span className="panel-kicker">NUEVO ARTÍCULO</span>
              <h2>Agregar producto</h2>
            </div>
          </div>
          <p className="panel-description">
            La cantidad y la unidad son opcionales. Elegí una categoría para encontrarlo más rápido.
          </p>

          <form className="shopping-add-form" onSubmit={handleAddSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="item-name">Producto *</label>
              <input
                id="item-name"
                type="text"
                className="menu-slot-input"
                placeholder="Ej: Tomates cherry, Leche descremada..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (formError) setFormError(null)
                }}
              />
            </div>

            <div className="form-row-two">
              <div className="form-field">
                <label htmlFor="item-qty">Cantidad (opcional)</label>
                <input
                  id="item-qty"
                  type="text"
                  className="menu-slot-input"
                  placeholder="Ej: 2, 500..."
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="item-unit">Unidad (opcional)</label>
                <input
                  id="item-unit"
                  type="text"
                  className="menu-slot-input"
                  placeholder="Ej: kg, g, litros, u."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="item-category">Categoría</label>
              <select
                id="item-category"
                className="menu-slot-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
              >
                {SHOPPING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {formError && <p className="form-error-msg" role="alert">{formError}</p>}

            <button type="submit" className="primary-button shopping-submit-btn">
              <Plus size={17} /> Agregar a la lista
            </button>
          </form>
        </section>

        <section className="panel shopping-list-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">TU LISTA</span>
              <h2>Productos ({filteredItems.length})</h2>
            </div>

            {totalCount > 0 && (
              <div className="menu-day-actions">
                {checkedCount > 0 && !confirmClearAll && (
                  <button
                    type="button"
                    className="slot-action-btn"
                    onClick={onClearChecked}
                  >
                    Limpiar comprados
                  </button>
                )}
                {!confirmClearAll ? (
                  <button
                    type="button"
                    className="clear-day-button"
                    onClick={() => setConfirmClearAll(true)}
                  >
                    <Trash2 size={13} /> Vaciar lista
                  </button>
                ) : (
                  <div className="confirm-clear-box">
                    <span>¿Vaciar toda la lista?</span>
                    <button
                      type="button"
                      className="confirm-yes-btn"
                      onClick={() => {
                        onClearAll()
                        setConfirmClearAll(false)
                        setEditingId(null)
                      }}
                    >
                      Sí, vaciar
                    </button>
                    <button
                      type="button"
                      className="confirm-no-btn"
                      onClick={() => setConfirmClearAll(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {totalCount > 0 && (
            <div className="shopping-progress shopping-progress--full">
              <span>
                {checkedCount} de {totalCount} comprados · {pendingCount}{' '}
                {pendingCount === 1 ? 'pendiente' : 'pendientes'}
              </span>
              <div className="progress-track">
                <div
                  style={{
                    width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="shopping-filters">
            <div className="status-filter-tabs" role="tablist" aria-label="Filtrar por estado">
              {(
                [
                  { id: 'todos', label: `Todos (${totalCount})` },
                  { id: 'pendientes', label: `Pendientes (${pendingCount})` },
                  { id: 'comprados', label: `Comprados (${checkedCount})` },
                ] as { id: ShoppingStatusFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`filter-tab ${statusFilter === tab.id ? 'filter-tab--active' : ''}`}
                  onClick={() => setStatusFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="category-filter-pills" aria-label="Filtrar por categoría">
              <button
                type="button"
                className={`category-pill ${categoryFilter === 'Todas' ? 'category-pill--active' : ''}`}
                onClick={() => setCategoryFilter('Todas')}
              >
                Todas
              </button>
              {SHOPPING_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${categoryFilter === cat ? 'category-pill--active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {totalCount === 0 ? (
            <div className="shopping-empty-state">
              <div className="shopping-empty-icon">
                <ShoppingBasket size={26} />
              </div>
              <strong>Tu lista de compras está vacía</strong>
              <p>Agregá tu primer producto desde el formulario para empezar a organizarte.</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="shopping-empty-state">
              <strong>No hay productos con este filtro</strong>
              <p>Probá cambiando el filtro de estado o de categoría para ver el resto de tu lista.</p>
              <button
                type="button"
                className="slot-action-btn"
                onClick={() => {
                  setStatusFilter('todos')
                  setCategoryFilter('Todas')
                }}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="shopping-full-list">
              {filteredItems.map((item) => {
                const isEditing = editingId === item.id
                const amountLabel = formatItemAmount(item)

                if (isEditing) {
                  return (
                    <form
                      key={item.id}
                      className="shopping-item-card shopping-item-card--editing"
                      onSubmit={(e) => handleEditSubmit(e, item.id)}
                    >
                      <div className="shopping-edit-grid">
                        <input
                          type="text"
                          className="menu-slot-input"
                          placeholder="Nombre del producto"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                        <input
                          type="text"
                          className="menu-slot-input"
                          placeholder="Cantidad"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                        />
                        <input
                          type="text"
                          className="menu-slot-input"
                          placeholder="Unidad"
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                        />
                        <select
                          className="menu-slot-select"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as ShoppingCategory)}
                        >
                          {SHOPPING_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      {editError && <p className="form-error-msg">{editError}</p>}
                      <div className="menu-slot-editor-actions">
                        <button type="submit" className="slot-save-btn">
                          <Check size={14} /> Guardar cambios
                        </button>
                        <button type="button" className="slot-cancel-btn" onClick={cancelEdit}>
                          <X size={14} /> Cancelar
                        </button>
                      </div>
                    </form>
                  )
                }

                return (
                  <div
                    key={item.id}
                    className={`shopping-item-card ${
                      item.checked ? 'shopping-item-card--checked' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="shopping-item-toggle"
                      onClick={() => onToggleItem(item.id)}
                      aria-label={
                        item.checked
                          ? `Desmarcar ${item.name} como comprado`
                          : `Marcar ${item.name} como comprado`
                      }
                    >
                      <span className="check-box">{item.checked && <Check size={13} />}</span>
                      <span className="shopping-item-copy">
                        <strong>{item.name}</strong>
                        <small>{amountLabel}</small>
                      </span>
                    </button>

                    <span
                      className={`status-badge ${
                        item.checked ? 'status-badge--checked' : 'status-badge--pending'
                      }`}
                    >
                      {item.checked ? 'Comprado' : 'Pendiente'}
                    </span>

                    <span className="category-label">{item.category}</span>

                    <div className="shopping-item-actions">
                      <button
                        type="button"
                        className="slot-action-btn"
                        aria-label={`Editar ${item.name}`}
                        onClick={() => startEdit(item)}
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      <button
                        type="button"
                        className="slot-action-btn slot-action-btn--danger"
                        aria-label={`Eliminar ${item.name}`}
                        onClick={() => onDeleteItem(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

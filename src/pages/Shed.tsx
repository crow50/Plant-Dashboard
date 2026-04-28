import { useState } from 'react';
import { Plus, Trash2, Edit, AlertTriangle, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShedSupply, SupplyCategory } from '../types';

const CATEGORIES: { value: SupplyCategory; label: string; emoji: string }[] = [
  { value: 'soil', label: 'Soil & Media', emoji: '🌱' },
  { value: 'fertilizer', label: 'Fertilizer', emoji: '⚡' },
  { value: 'amendment', label: 'Amendments', emoji: '🧪' },
  { value: 'pesticide', label: 'Pest Control', emoji: '🐛' },
  { value: 'tool', label: 'Tools', emoji: '🔧' },
  { value: 'container', label: 'Containers', emoji: '🪴' },
  { value: 'other', label: 'Other', emoji: '📦' },
];

const UNITS = ['lbs', 'oz', 'kg', 'g', 'gallons', 'liters', 'quarts', 'cups', 'bags', 'boxes', 'count'];

function defaultSupply(): Omit<ShedSupply, 'id'> {
  return {
    name: '',
    category: 'fertilizer',
    brand: '',
    quantity: 1,
    unit: 'lbs',
    npk: '',
    notes: '',
    lowStockThreshold: undefined,
  };
}

export default function Shed() {
  const { state, addSupply, updateSupply, deleteSupply } = useApp();
  const { shedSupplies } = state;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SupplyCategory | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ShedSupply, 'id'>>(defaultSupply());

  const filtered = shedSupplies.filter(s => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.brand?.toLowerCase().includes(q);
    }
    return true;
  });

  const byCategory: Record<SupplyCategory, ShedSupply[]> = {
    soil: [], fertilizer: [], amendment: [], pesticide: [], tool: [], container: [], other: [],
  };
  filtered.forEach(s => byCategory[s.category].push(s));

  function openAdd() {
    setForm(defaultSupply());
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(supply: ShedSupply) {
    setForm({ ...supply });
    setEditingId(supply.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (editingId) {
      updateSupply({ ...form, id: editingId });
    } else {
      addSupply({ ...form, id: crypto.randomUUID() });
    }
    setShowForm(false);
  }

  function set<K extends keyof ShedSupply>(key: K, val: ShedSupply[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  const lowStock = shedSupplies.filter(s => s.lowStockThreshold !== undefined && s.quantity <= s.lowStockThreshold);

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🏚️ The Shed
          </h1>
          <p className="text-garden-300 text-sm">{shedSupplies.length} supplies tracked</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> Add Supply
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-orange-900/30 border border-orange-700 rounded-xl p-4">
          <h3 className="text-orange-300 font-medium flex items-center gap-2 mb-2">
            <AlertTriangle size={16} /> Running Low
          </h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(s => (
              <span key={s.id} className="badge bg-orange-800 text-orange-200">
                {s.name}: {s.quantity} {s.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-white">{editingId ? 'Edit Supply' : 'Add New Supply'}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Product Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Fox Farm Ocean Forest" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => set('category', e.target.value as SupplyCategory)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <input className="input" value={form.brand ?? ''} onChange={e => set('brand', e.target.value)} placeholder="Fox Farm, Espoma…" />
            </div>
            <div>
              <label className="label">Quantity</label>
              <input type="number" className="input" min="0" step="0.5" value={form.quantity} onChange={e => set('quantity', +e.target.value)} />
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {form.category === 'fertilizer' && (
              <div>
                <label className="label">NPK Ratio</label>
                <input className="input" value={form.npk ?? ''} onChange={e => set('npk', e.target.value)} placeholder="e.g. 5-1-1" />
              </div>
            )}
            <div>
              <label className="label">Low Stock Alert (optional)</label>
              <input
                type="number"
                className="input"
                min="0"
                value={form.lowStockThreshold ?? ''}
                onChange={e => set('lowStockThreshold', e.target.value ? +e.target.value : undefined)}
                placeholder={`Alert when ≤ X ${form.unit}`}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <input className="input" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Any notes…" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={handleSubmit} disabled={!form.name}>
              {editingId ? 'Save Changes' : 'Add to Shed'}
            </button>
            <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-garden-400" />
          <input className="input pl-9" placeholder="Search supplies…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              categoryFilter === 'all' ? 'bg-garden-500 text-white' : 'bg-garden-700 text-garden-300 hover:bg-garden-600'
            }`}
          >
            📦 All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === c.value ? 'bg-garden-500 text-white' : 'bg-garden-700 text-garden-300 hover:bg-garden-600'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🏚️</div>
          <h2 className="text-lg font-semibold text-white mb-2">
            {shedSupplies.length === 0 ? 'Your shed is empty' : 'No supplies match your search'}
          </h2>
          <p className="text-garden-300 text-sm mb-4">Track fertilizers, soil, tools, and amendments.</p>
          <button className="btn-primary inline-flex items-center gap-2" onClick={openAdd}>
            <Plus size={16} /> Add First Supply
          </button>
        </div>
      )}

      {/* Supply list by category */}
      {filtered.length > 0 && (
        <div className="space-y-6">
          {CATEGORIES.map(cat => {
            const items = byCategory[cat.value];
            if (items.length === 0) return null;
            return (
              <div key={cat.value}>
                <h3 className="text-sm font-semibold text-garden-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                  {cat.emoji} {cat.label} <span className="text-garden-500 font-normal">({items.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(supply => {
                    const isLow = supply.lowStockThreshold !== undefined && supply.quantity <= supply.lowStockThreshold;
                    return (
                      <div key={supply.id} className={`card-sm p-4 ${isLow ? 'border-orange-700' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{supply.name}</div>
                            {supply.brand && <div className="text-xs text-garden-400">{supply.brand}</div>}
                            {supply.npk && (
                              <div className="badge bg-garden-600 text-garden-200 mt-1">NPK {supply.npk}</div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(supply)} className="text-garden-400 hover:text-white p-1">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => deleteSupply(supply.id)} className="text-garden-400 hover:text-red-400 p-1">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 mt-3 text-lg font-bold ${isLow ? 'text-orange-400' : 'text-white'}`}>
                          {isLow && <AlertTriangle size={16} />}
                          {supply.quantity} {supply.unit}
                        </div>
                        {supply.lowStockThreshold !== undefined && (
                          <div className="mt-1">
                            <div className="h-1.5 bg-garden-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isLow ? 'bg-orange-500' : 'bg-garden-400'}`}
                                style={{ width: `${Math.min(100, (supply.quantity / (supply.lowStockThreshold * 3)) * 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-garden-500 mt-1">Alert at {supply.lowStockThreshold} {supply.unit}</div>
                          </div>
                        )}
                        {supply.notes && (
                          <div className="text-xs text-garden-400 mt-2 border-t border-garden-700 pt-2">{supply.notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

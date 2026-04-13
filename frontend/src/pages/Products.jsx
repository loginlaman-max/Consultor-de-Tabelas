import { useEffect, useState } from 'react';
import { api } from '../api.js';

const fmt = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const emptyForm = { sku: '', name: '', description: '', category: '', price: 0, stock: 0, image_url: '' };

export default function Products() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setItems(await api.listProducts(q, category));
    setCategories(await api.productCategories());
  }

  useEffect(() => { load(); }, [q, category]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({ ...p });
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    if (editing) {
      await api.updateProduct(editing.id, { ...form, active: 1 });
    } else {
      await api.createProduct(form);
    }
    setShowForm(false);
    load();
  }

  async function remove(p) {
    if (!confirm(`Inativar "${p.name}"?`)) return;
    await api.deleteProduct(p.id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Catálogo de Produtos</h1>
        <button className="btn-primary" onClick={openNew}>+ Novo produto</button>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4">
          <input className="input flex-1" placeholder="Buscar por nome, SKU, descrição..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input w-56" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">SKU</th>
                <th className="th">Produto</th>
                <th className="th">Categoria</th>
                <th className="th">Preço</th>
                <th className="th">Estoque</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="td font-mono text-xs">{p.sku}</td>
                  <td className="td font-medium">{p.name}</td>
                  <td className="td">{p.category}</td>
                  <td className="td">{fmt(p.price)}</td>
                  <td className="td">{p.stock}</td>
                  <td className="td text-right space-x-2">
                    <button className="text-brand-600 hover:underline text-sm" onClick={() => openEdit(p)}>Editar</button>
                    <button className="text-red-600 hover:underline text-sm" onClick={() => remove(p)}>Remover</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="6" className="td text-center text-slate-400 py-8">Nenhum produto encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={editing ? 'Editar produto' : 'Novo produto'}>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU"><input className="input" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
              <Field label="Categoria"><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            </div>
            <Field label="Nome"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Descrição"><textarea className="input" rows="2" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço"><input type="number" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
              <Field label="Estoque"><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
            </div>
            <Field label="URL da imagem"><input className="input" value={form.image_url || ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Salvar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const emptyForm = {
  company_name: '', trade_name: '', document: '', email: '', phone: '',
  address: '', city: '', state: '', payment_terms: '', notes: '',
};

export default function Customers() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setItems(await api.listCustomers(q));
  }
  useEffect(() => { load(); }, [q]);

  async function submit(e) {
    e.preventDefault();
    await api.createCustomer(form);
    setShowForm(false);
    setForm(emptyForm);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Novo cliente</button>
      </div>

      <div className="card">
        <input className="input mb-4" placeholder="Buscar por razão social, documento, cidade..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Razão social</th>
                <th className="th">Documento</th>
                <th className="th">Cidade/UF</th>
                <th className="th">Contato</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="td font-medium">{c.company_name}</td>
                  <td className="td">{c.document}</td>
                  <td className="td">{c.city} / {c.state}</td>
                  <td className="td">{c.phone}<br /><span className="text-xs text-slate-500">{c.email}</span></td>
                  <td className="td text-right">
                    <Link to={`/customers/${c.id}`} className="text-brand-600 hover:underline text-sm">Ver</Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="5" className="td text-center text-slate-400 py-8">Nenhum cliente</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Novo cliente</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-3">
              <Field label="Razão social" required value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome fantasia" value={form.trade_name} onChange={(v) => setForm({ ...form, trade_name: v })} />
                <Field label="CNPJ/CPF" value={form.document} onChange={(v) => setForm({ ...form, document: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              </div>
              <Field label="Endereço" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="UF" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                <Field label="Cond. pagamento" value={form.payment_terms} onChange={(v) => setForm({ ...form, payment_terms: v })} />
              </div>
              <Field label="Observações" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      <input type={type} required={required} className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

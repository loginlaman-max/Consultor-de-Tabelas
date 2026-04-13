import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const fmt = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusColors = {
  draft: 'bg-slate-200 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');

  async function load() {
    setItems(await api.listOrders(status));
  }
  useEffect(() => { load(); }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <Link to="/orders/new" className="btn-primary">+ Novo pedido</Link>
      </div>

      <div className="card">
        <select className="input w-56 mb-4" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="sent">Enviado</option>
          <option value="approved">Aprovado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">#</th>
                <th className="th">Cliente</th>
                <th className="th">Status</th>
                <th className="th">Total</th>
                <th className="th">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="td"><Link to={`/orders/${o.id}`} className="text-brand-600 hover:underline font-medium">#{o.id}</Link></td>
                  <td className="td">{o.customer_name}</td>
                  <td className="td">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || ''}`}>{o.status}</span>
                  </td>
                  <td className="td font-medium">{fmt(o.total)}</td>
                  <td className="td">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="5" className="td text-center text-slate-400 py-8">Nenhum pedido</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

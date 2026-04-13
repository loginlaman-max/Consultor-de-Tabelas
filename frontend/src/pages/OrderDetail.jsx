import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const fmt = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  async function load() {
    setOrder(await api.getOrder(id));
  }
  useEffect(() => { load(); }, [id]);

  async function updateStatus(status) {
    await api.updateOrderStatus(id, status);
    load();
  }

  async function remove() {
    if (!confirm('Excluir este pedido?')) return;
    await api.deleteOrder(id);
    navigate('/orders');
  }

  if (!order) return <p className="text-slate-500">Carregando...</p>;

  const subtotal = order.items.reduce((a, it) => a + it.subtotal, 0);

  return (
    <div className="space-y-6">
      <Link to="/orders" className="text-sm text-brand-600 hover:underline">&larr; Voltar</Link>
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pedido #{order.id}</h1>
            <p className="text-slate-500">{order.customer_name} · {order.customer_document}</p>
            <p className="text-xs text-slate-400">Criado em {new Date(order.created_at).toLocaleString('pt-BR')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Status atual</p>
            <p className="text-lg font-semibold capitalize">{order.status}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button className="btn-secondary text-sm" onClick={() => updateStatus('draft')}>Rascunho</button>
          <button className="btn-secondary text-sm" onClick={() => updateStatus('sent')}>Enviar</button>
          <button className="btn-primary text-sm" onClick={() => updateStatus('approved')}>Aprovar</button>
          <button className="btn-secondary text-sm" onClick={() => updateStatus('cancelled')}>Cancelar</button>
          <button className="btn-danger text-sm ml-auto" onClick={remove}>Excluir</button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Itens</h2>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">SKU</th>
              <th className="th">Produto</th>
              <th className="th">Qtd</th>
              <th className="th">Preço</th>
              <th className="th">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="td font-mono text-xs">{it.sku}</td>
                <td className="td">{it.product_name}</td>
                <td className="td">{it.quantity}</td>
                <td className="td">{fmt(it.unit_price)}</td>
                <td className="td font-medium">{fmt(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 pt-4 border-t space-y-1 text-right text-sm">
          <p>Subtotal: <span className="font-medium">{fmt(subtotal)}</span></p>
          <p>Desconto: <span className="font-medium">{fmt(order.discount)}</span></p>
          <p className="text-lg">Total: <span className="font-bold text-brand-600">{fmt(order.total)}</span></p>
        </div>
      </div>
    </div>
  );
}

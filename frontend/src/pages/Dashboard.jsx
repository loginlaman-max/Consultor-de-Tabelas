import { useEffect, useState } from 'react';
import { api } from '../api.js';

const fmt = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Carregando...</p>;
  if (!data) return <p className="text-red-600">Erro ao carregar</p>;

  const { totals, byStatus, topProducts, topCustomers, monthly } = data;
  const maxMonthly = Math.max(...monthly.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Produtos ativos" value={totals.products} />
        <Stat label="Clientes" value={totals.customers} />
        <Stat label="Pedidos" value={totals.orders} />
        <Stat label="Receita" value={fmt(totals.revenue)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Receita mensal</h2>
          <div className="flex items-end gap-2 h-40">
            {monthly.length === 0 && <p className="text-slate-400 text-sm">Sem dados</p>}
            {monthly.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-brand-500 rounded-t"
                  style={{ height: `${(m.revenue / maxMonthly) * 100}%` }}
                  title={fmt(m.revenue)}
                />
                <span className="text-xs text-slate-500">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Pedidos por status</h2>
          <div className="space-y-2">
            {byStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-600">{s.status}</span>
                <span className="font-medium">{s.count} · {fmt(s.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Top produtos</h2>
          <table className="w-full text-sm">
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 text-right text-slate-500">{p.qty} un</td>
                  <td className="py-2 text-right font-medium">{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Top clientes</h2>
          <table className="w-full text-sm">
            <tbody>
              {topCustomers.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2">{c.company_name}</td>
                  <td className="py-2 text-right text-slate-500">{c.orders_count} ped.</td>
                  <td className="py-2 text-right font-medium">{fmt(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

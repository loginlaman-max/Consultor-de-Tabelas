import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

const fmt = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    api.getCustomer(id).then(setCustomer);
  }, [id]);

  if (!customer) return <p className="text-slate-500">Carregando...</p>;

  return (
    <div className="space-y-6">
      <Link to="/customers" className="text-sm text-brand-600 hover:underline">&larr; Voltar</Link>
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-800">{customer.company_name}</h1>
        <p className="text-slate-500">{customer.trade_name}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
          <Info label="Documento" value={customer.document} />
          <Info label="E-mail" value={customer.email} />
          <Info label="Telefone" value={customer.phone} />
          <Info label="Endereço" value={customer.address} />
          <Info label="Cidade/UF" value={`${customer.city} / ${customer.state}`} />
          <Info label="Cond. pagamento" value={customer.payment_terms} />
        </div>
        {customer.notes && (
          <div className="mt-4 text-sm">
            <p className="text-slate-500 text-xs uppercase">Observações</p>
            <p>{customer.notes}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Histórico de pedidos</h2>
        {customer.orders.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhum pedido</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">#</th>
                <th className="th">Status</th>
                <th className="th">Total</th>
                <th className="th">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customer.orders.map((o) => (
                <tr key={o.id}>
                  <td className="td"><Link className="text-brand-600 hover:underline" to={`/orders/${o.id}`}>#{o.id}</Link></td>
                  <td className="td capitalize">{o.status}</td>
                  <td className="td">{fmt(o.total)}</td>
                  <td className="td">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase">{label}</p>
      <p className="text-slate-800">{value || '—'}</p>
    </div>
  );
}

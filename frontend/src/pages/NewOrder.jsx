import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const fmt = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function NewOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.listCustomers().then(setCustomers);
    api.listProducts().then(setProducts);
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())
  );

  function addProduct(p) {
    const exists = cart.find((it) => it.product_id === p.id);
    if (exists) {
      setCart(cart.map((it) => it.product_id === p.id ? { ...it, quantity: it.quantity + 1 } : it));
    } else {
      setCart([...cart, { product_id: p.id, name: p.name, sku: p.sku, unit_price: p.price, quantity: 1 }]);
    }
  }

  function updateQty(pid, qty) {
    setCart(cart.map((it) => it.product_id === pid ? { ...it, quantity: Math.max(1, Number(qty) || 1) } : it));
  }

  function updatePrice(pid, price) {
    setCart(cart.map((it) => it.product_id === pid ? { ...it, unit_price: Number(price) || 0 } : it));
  }

  function remove(pid) {
    setCart(cart.filter((it) => it.product_id !== pid));
  }

  const subtotal = cart.reduce((a, it) => a + it.unit_price * it.quantity, 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  async function save(status) {
    if (!customerId || cart.length === 0) {
      alert('Selecione um cliente e adicione itens');
      return;
    }
    setSaving(true);
    try {
      const { id } = await api.createOrder({
        customer_id: Number(customerId),
        items: cart.map(({ product_id, quantity, unit_price }) => ({ product_id, quantity, unit_price })),
        discount: Number(discount) || 0,
        notes,
        status,
      });
      navigate(`/orders/${id}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Novo pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
            <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Selecione...</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>

          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-3">Adicionar produtos</h2>
            <input className="input mb-3" placeholder="Buscar produto..." value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="max-h-64 overflow-auto divide-y">
              {filtered.slice(0, 20).map((p) => (
                <div key={p.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.sku} · Estoque: {p.stock}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{fmt(p.price)}</span>
                    <button className="btn-primary text-xs" onClick={() => addProduct(p)}>Adicionar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card h-fit sticky top-6">
          <h2 className="font-semibold text-slate-800 mb-3">Carrinho</h2>
          {cart.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhum item</p>
          ) : (
            <div className="space-y-3">
              {cart.map((it) => (
                <div key={it.product_id} className="border-b pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium flex-1">{it.name}</p>
                    <button className="text-red-500 text-xs ml-2" onClick={() => remove(it.product_id)}>remover</button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input type="number" min="1" className="input text-xs py-1 w-16" value={it.quantity} onChange={(e) => updateQty(it.product_id, e.target.value)} />
                    <span className="text-xs">×</span>
                    <input type="number" step="0.01" className="input text-xs py-1 flex-1" value={it.unit_price} onChange={(e) => updatePrice(it.product_id, e.target.value)} />
                  </div>
                  <p className="text-right text-sm font-medium mt-1">{fmt(it.unit_price * it.quantity)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Desconto</span>
              <input type="number" step="0.01" className="input text-xs py-1 w-24 text-right" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div className="flex justify-between text-lg font-bold text-brand-600 pt-2 border-t">
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          </div>

          <textarea className="input mt-3 text-sm" rows="2" placeholder="Observações..." value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="flex flex-col gap-2 mt-3">
            <button className="btn-secondary" disabled={saving} onClick={() => save('draft')}>Salvar rascunho</button>
            <button className="btn-primary" disabled={saving} onClick={() => save('sent')}>Enviar pedido</button>
          </div>
        </div>
      </div>
    </div>
  );
}

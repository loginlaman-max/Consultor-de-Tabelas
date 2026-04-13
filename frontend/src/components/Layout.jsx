import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const nav = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l9-9 9 9M4 10v10h16V10' },
  { to: '/products', label: 'Produtos', icon: 'M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4v12h16V7z' },
  { to: '/customers', label: 'Clientes', icon: 'M12 11a4 4 0 100-8 4 4 0 000 8zm-8 10a8 8 0 0116 0' },
  { to: '/orders', label: 'Pedidos', icon: 'M9 5h6l2 2h4v12H3V7h4l2-2z' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-200">
          <h1 className="text-xl font-bold text-brand-600">Mercos Clone</h1>
          <p className="text-xs text-slate-500">Força de Vendas B2B</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500 mb-2">{user?.email}</p>
          <button onClick={handleLogout} className="btn-secondary w-full text-sm">Sair</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}

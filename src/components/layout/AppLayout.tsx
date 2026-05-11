import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/', label: 'Início' },
  { to: '/stores', label: 'Explorar lojas' },
  { to: '/cart', label: 'Carrinho' },
  { to: '/dashboard', label: 'Painel lojista' },
  { to: '/admin', label: 'Super Admin' },
]

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div>
              <p className="brand-kicker">Marketplace Multi-lojas</p>
              <h1 className="brand-title">Plataforma de Vendas</h1>
            </div>
            <NavLink to="/login" className="btn btn-secondary">
              Login
            </NavLink>
          </div>
          <nav className="top-nav" aria-label="Navegação principal">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  )
}

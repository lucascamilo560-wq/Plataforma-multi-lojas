import { Outlet } from 'react-router-dom'

export function StorefrontLayout() {
  return (
    <div className="app-shell">
      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  )
}

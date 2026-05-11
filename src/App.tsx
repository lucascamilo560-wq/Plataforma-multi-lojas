import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/routes/AppRoutes'

const basename = import.meta.env.BASE_URL

function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App

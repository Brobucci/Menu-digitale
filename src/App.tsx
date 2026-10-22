import { Route, Routes } from 'react-router'
import { MENU_SOURCE } from './config'
import { AdminPage } from './pages/AdminPage'
import { CustomerPage } from './pages/CustomerPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AuthGate } from './auth/AuthGate'
import { AuthProvider } from './auth/AuthProvider'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<CustomerPage />} />
        {/* Con il foglio Google il menù si modifica nel foglio: il pannello non esiste. */}
        {MENU_SOURCE === 'api' && (
          <Route
            path="/admin"
            element={
              <AuthGate>
                <AdminPage />
              </AuthGate>
            }
          />
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}

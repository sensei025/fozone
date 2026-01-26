import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { isAuthenticated } from './services/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WifiZones from './pages/WifiZones';
import WifiZoneDetail from './pages/WifiZoneDetail';
import Pricings from './pages/Pricings';
import Tickets from './pages/Tickets';
import Accounting from './pages/Accounting';
import Profile from './pages/Profile';
import BuyTicket from './pages/BuyTicket';
import PaymentReturn from './pages/PaymentReturn';

function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setLoading(false);
  }, [location]); // Re-vérifier à chaque changement de route

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Routes publiques (pas d'authentification requise) */}
        <Route path="/buy/:zoneId" element={<BuyTicket />} />
        <Route path="/payment/return" element={<PaymentReturn />} />
        
        {/* Routes d'authentification */}
        <Route path="/login" element={!authenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!authenticated ? <Register /> : <Navigate to="/dashboard" replace />} />
        
        {/* Routes protégées (nécessitent authentification) */}
        <Route path="/" element={authenticated ? <Layout /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="zones" element={<WifiZones />} />
          <Route path="zones/:id" element={<WifiZoneDetail />} />
          <Route path="pricings" element={<Pricings />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;


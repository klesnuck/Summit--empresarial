import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import MyTickets from './pages/MyTickets';
import TicketView from './pages/TicketView';
import StaffValidator from './pages/StaffValidator';

function Layout({ children }) {
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/boleto/') || location.pathname.startsWith('/validar');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      {!isStandalone && <Navbar />}
      <div className="flex-grow">{children}</div>
      {!isStandalone && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mi-cuenta" element={<MyTickets />} />
            <Route path="/mis-boletos" element={<MyTickets />} />
            <Route path="/boleto/:codigo" element={<TicketView />} />
            <Route path="/validar" element={<StaffValidator />} />
            <Route path="/validar/:codigo" element={<StaffValidator />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}


import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import NewInvoice from './pages/NewInvoice';
import Settings from './pages/Settings';
import InvoiceDetail from './pages/InvoiceDetail';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="bg-[#C8E4F0] min-h-screen flex justify-center">
          <div className="w-full max-w-[430px] relative bg-[#F0F8FB] min-h-screen shadow-2xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/new" element={<NewInvoice />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/invoice/:id" element={<InvoiceDetail />} />
            </Routes>
            <BottomNav />
          </div>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;

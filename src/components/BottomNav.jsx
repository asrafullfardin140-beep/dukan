import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Home, Settings } from 'lucide-react';

export default function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  if (location.pathname === '/new' || location.pathname.startsWith('/invoice/')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-gray-100 flex justify-around items-center h-20 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-[#1AABDD]' : 'text-gray-400'}`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-[#1AABDD]/10' : ''}`}>
              <Home size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold">{t('home')}</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-[#1AABDD]' : 'text-gray-400'}`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-[#1AABDD]/10' : ''}`}>
              <Settings size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold">{t('settings')}</span>
          </>
        )}
      </NavLink>
    </div>
  );
}

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { state } = useAuth();
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/home':
        return 'Home';
      case '/configuracoes':
        return 'Configurações';
      case '/vendas':
        return 'Vendas';
      case '/clientes':
        return 'Clientes';
      case '/relatorios':
        return 'Relatórios';
      default:
        return 'ImobiGest';
    }
  };

  return (
    <header className="bg-black shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold ml-2 text-white">{getPageTitle()}</h1>
        </div>
        
      </div>
    </header>
  );
};

export default Header;
'use client';

import { useState } from 'react';
import Sidebar from '../components/sidebar/Siderbar';
import Header from '../components/header/Header';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mostrar loading se ainda estiver verificando autenticação
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onToggleSidebar={toggleSidebar} />

        {/* Main Content
        <main className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Total de Imóveis</h2>
              <p className="text-3xl font-bold text-blue-600">125</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Contratos Ativos</h2>
              <p className="text-3xl font-bold text-green-600">87</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Receita Mensal</h2>
              <p className="text-3xl font-bold text-purple-600">R$ 45.230</p>
            </div>
          </div>
        </main> */}
      </div>
    </div>
  );
}
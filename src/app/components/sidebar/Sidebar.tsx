'use client';

import { FaHome, FaMoneyBill, FaUserFriends, FaCog, FaDoorOpen} from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    { icon: <FaHome />, label: 'Home', href: '/home' },
    { icon: <FaMoneyBill/>, label: 'Vendas', href: '/vendas' },
    { icon: <FaUserFriends />, label: 'Profissionais', href: '/profissionais' },
    { icon: <FaCog />, label: 'Configuracoes', href: '/configuracoes' }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white  z-30 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
        w-64
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">ImobiGest</h2>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors text-left cursor-pointer"
          >
            <FaDoorOpen />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, Star, User, LogOut, Menu, X, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/Layout/Brand/logo-colored.png';

const SupplierLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/supplier/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/supplier/products', icon: Package, label: 'My Products' },
    { to: '/supplier/orders', icon: ShoppingBag, label: 'My Orders' },
    { to: '/supplier/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/supplier/reports', icon: Star, label: 'Customer Reports' },
    { to: '/supplier/profile', icon: User, label: 'My Profile' },
  ];

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
          <img src={logo} alt="Logo" className="h-8 brightness-0 invert" />
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <div className="px-3 py-2 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Supplier Panel</div>
        <nav className="px-2 flex-1 overflow-y-auto pb-2">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors text-sm font-medium ${isActive(to, exact) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700 flex-shrink-0">
          <div className="px-2 py-1 mb-2">
            <p className="font-medium text-gray-300 text-sm truncate">{user?.name}</p>
            <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">Supplier</span>
          </div>
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800 mb-1 transition-colors">
            <ChevronRight className="w-3 h-3" /> Back to Store
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 w-full transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
          <h1 className="font-semibold text-gray-800 text-sm">
            {navItems.find(n => isActive(n.to, n.exact))?.label || 'Supplier Panel'}
          </h1>
          <div className="ml-auto text-xs text-gray-400">Supplier Dashboard</div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupplierLayout;

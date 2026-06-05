import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Menu, X, Mail, MessageSquare, Globe, Clock, Settings, Bell, Store, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMsg, setUnreadMsg] = useState(0);

  useEffect(() => {
    API.get('/messages/unread-count').then(({data})=>setUnreadMsg(data.count)).catch(()=>{});
    const interval = setInterval(() => {
      API.get('/messages/unread-count').then(({data})=>setUnreadMsg(data.count)).catch(()=>{});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to:'/admin', icon:LayoutDashboard, label:'Dashboard', exact:true },
    { to:'/admin/products', icon:Package, label:'Products' },
    { to:'/admin/orders', icon:ShoppingBag, label:'Orders' },
    { to:'/admin/users', icon:Users, label:'Users' },
    { to:'/admin/suppliers', icon:Store, label:'Suppliers' },
    { to:'/admin/categories', icon:Tag, label:'Categories' },
    { to:'/admin/deals', icon:Clock, label:'Deals & Offers' },
    { to:'/admin/newsletter', icon:Mail, label:'Newsletter' },
    { to:'/admin/inquiries', icon:MessageSquare, label:'Inquiries' },
    { to:'/admin/messages', icon:Bell, label:'Messages', badge: unreadMsg },
    { to:'/admin/regions', icon:Globe, label:'Regions' },
    { to:'/admin/settings', icon:Settings, label:'Settings' },
  ];

  const isActive = (to, exact) => exact ? location.pathname===to : location.pathname.startsWith(to);
  const handleLogout = () => { logout(); navigate('/'); };
  const currentLabel = navItems.find(n=>isActive(n.to,n.exact))?.label||'Admin';

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-950 to-violet-950 text-white flex flex-col transform transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} shadow-2xl`}>
        {/* Logo area */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight">ShopNova</span>
              <div className="text-[10px] text-indigo-300 font-medium -mt-0.5">Admin Console</div>
            </div>
          </div>
          <button className="lg:hidden text-indigo-300 hover:text-white" onClick={()=>setSidebarOpen(false)}>
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-5 pt-4 pb-1 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Main Menu</div>

        {/* Navigation */}
        <nav className="px-3 flex-1 overflow-y-auto pb-2 space-y-0.5">
          {navItems.map(({to,icon:Icon,label,exact,badge})=>(
            <Link key={to} to={to} onClick={()=>setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group
                ${isActive(to,exact)
                  ? 'bg-indigo-500/30 text-white shadow-sm border border-indigo-400/20'
                  : 'text-indigo-300 hover:bg-white/8 hover:text-white'
                }`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                ${isActive(to,exact) ? 'bg-indigo-500 shadow-md shadow-indigo-900' : 'bg-white/5 group-hover:bg-white/10'}`}>
                <Icon className="w-3.5 h-3.5"/>
              </div>
              <span className="flex-1">{label}</span>
              {badge>0 && (
                <span className="bg-red-500 text-white text-[9px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1">
                  {badge>9?'9+':badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
              <p className="text-indigo-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 w-full transition-colors mt-1">
            <LogOut className="w-4 h-4"/> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={()=>setSidebarOpen(false)}/>}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center gap-4 flex-shrink-0 shadow-sm">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={()=>setSidebarOpen(true)}>
            <Menu className="w-5 h-5"/>
          </button>

          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-indigo-500 rounded-full"></div>
            <h1 className="font-bold text-gray-800 text-sm">{currentLabel}</h1>
          </div>

          {unreadMsg>0 && (
            <span className="bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full font-semibold">
              {unreadMsg} new
            </span>
          )}

          <div className="ml-auto flex items-center gap-3">
            <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1">
              <ShoppingCart className="w-3.5 h-3.5"/> View Store
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 lg:p-7">
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import API from '../../utils/api';

const StatCard = ({ icon: Icon, label, value, gradient, iconBg, sub }) => (
  <div className={`rounded-2xl p-5 text-white relative overflow-hidden ${gradient} shadow-lg`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
    <div className="relative z-10">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-3xl font-black mb-1">{value}</p>
      <p className="text-white/80 text-sm font-medium">{label}</p>
      {sub && (
        <div className="flex items-center gap-1 mt-2">
          <ArrowUpRight className="w-3 h-3 text-green-300" />
          <p className="text-xs text-green-300 font-semibold">{sub}</p>
        </div>
      )}
    </div>
  </div>
);

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border border-blue-200',
  shipped: 'bg-violet-100 text-violet-700 border border-violet-200',
  delivered: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border border-red-200'
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard').then(({ data }) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
        <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-gray-200">
      Failed to load dashboard data
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-black text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.total_users} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" iconBg="bg-white/20" />
        <StatCard icon={Package} label="Total Products" value={stats.total_products} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" iconBg="bg-white/20" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.total_orders} gradient="bg-gradient-to-br from-violet-500 to-violet-700" iconBg="bg-white/20" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${parseFloat(stats.total_revenue).toFixed(0)}`} gradient="bg-gradient-to-br from-orange-500 to-rose-600" iconBg="bg-white/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              Recent Orders
            </h2>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">Latest</span>
          </div>
          <div className="space-y-3">
            {stats.recent_orders?.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">#{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.user_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${parseFloat(order.total_amount).toFixed(2)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mt-0.5 inline-block ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Top Products
            </h2>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">Trending</span>
          </div>
          <div className="space-y-3">
            {stats.top_products?.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <span className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center font-black flex-shrink-0
                  ${i===0?'bg-amber-100 text-amber-700':i===1?'bg-gray-100 text-gray-600':i===2?'bg-orange-100 text-orange-700':'bg-indigo-50 text-indigo-500'}`}>
                  {i+1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.total_orders} orders</p>
                </div>
                <span className="text-sm font-bold text-gray-900">${parseFloat(p.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Orders by Status</h2>
        <div className="flex flex-wrap gap-3">
          {stats.orders_by_status?.map(s => (
            <div key={s.status} className={`px-5 py-3 rounded-xl ${statusColors[s.status] || 'bg-gray-100 text-gray-600'}`}>
              <span className="font-black text-2xl block leading-tight">{s.count}</span>
              <span className="text-xs capitalize font-semibold opacity-80">{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

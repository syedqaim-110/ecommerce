import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, Star, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react';
import API from '../../utils/api';

const statusColors = { pending:'bg-yellow-100 text-yellow-700', processing:'bg-blue-100 text-blue-700', shipped:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' };

const StatCard = ({ icon: Icon, label, value, color, sub, link }) => (
  <Link to={link || '#'} className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow ${link ? 'cursor-pointer' : ''}`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    {sub && <p className="text-xs text-green-500 mt-1">{sub}</p>}
  </Link>
);

const SupplierDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/suppliers/dashboard').then(({ data }) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  if (!stats) return (
    <div className="text-center py-16">
      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-700 mb-2">Complete your supplier profile</h2>
      <p className="text-gray-500 text-sm mb-4">Set up your profile to start selling</p>
      <Link to="/supplier/profile" className="bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors inline-block">Setup Profile</Link>
    </div>
  );

  const { supplier, total_products, total_orders, total_revenue, total_reviews, recent_orders, top_products, unread_messages } = stats;

  return (
    <div className="space-y-6">
      {/* Verification Banner */}
      {!supplier?.is_verified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">⏳</div>
          <div>
            <p className="font-semibold text-yellow-800 text-sm">Account Pending Verification</p>
            <p className="text-yellow-600 text-xs">Admin will verify your account within 24-48 hours. You can still add products.</p>
          </div>
        </div>
      )}
      {supplier?.is_verified && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Verified Supplier ✓</p>
            <p className="text-green-600 text-xs">Your account is verified. Customers can see your products.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Products" value={total_products} color="bg-blue-500" link="/supplier/products" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={total_orders} color="bg-green-500" link="/supplier/orders" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${parseFloat(total_revenue||0).toFixed(0)}`} color="bg-purple-500" />
        <StatCard icon={Star} label="Reviews" value={total_reviews} color="bg-orange-500" link="/supplier/reports"
          sub={unread_messages > 0 ? `${unread_messages} unread messages` : null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Recent Orders</h2>
            <Link to="/supplier/orders" className="text-blue-500 text-xs hover:underline">View all</Link>
          </div>
          {recent_orders?.length ? recent_orders.map(o => (
            <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{o.customer_name}</p>
                <p className="text-xs text-gray-400 truncate max-w-[160px]">{o.product_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-700">${parseFloat(o.total_amount).toFixed(2)}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[o.status]}`}>{o.status}</span>
              </div>
            </div>
          )) : <p className="text-gray-400 text-sm text-center py-6">No orders yet</p>}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Top Products</h2>
            <Link to="/supplier/products" className="text-blue-500 text-xs hover:underline">Manage</Link>
          </div>
          {top_products?.length ? top_products.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.total_orders} sold · Stock: {p.stock}</p>
              </div>
              <span className="font-bold text-sm text-gray-700 flex-shrink-0">${parseFloat(p.price).toFixed(2)}</span>
            </div>
          )) : <p className="text-gray-400 text-sm text-center py-6">No products yet</p>}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/supplier/products', icon: Package, label: 'Add Product', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
            { to: '/supplier/orders', icon: ShoppingBag, label: 'View Orders', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
            { to: '/supplier/messages', icon: MessageSquare, label: 'Messages', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', badge: unread_messages },
            { to: '/supplier/reports', icon: Star, label: 'Reports', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
          ].map(a => (
            <Link key={a.to} to={a.to} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors relative ${a.color}`}>
              <a.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{a.label}</span>
              {a.badge > 0 && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{a.badge}</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;

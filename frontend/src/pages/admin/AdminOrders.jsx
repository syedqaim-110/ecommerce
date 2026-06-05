import React, { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const statusColors = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await API.get(`/orders?${params}`);
      setOrders(data.orders); setTotal(data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const viewOrder = async (order) => {
    setSelectedOrder(order);
    try {
      const { data } = await API.get(`/orders/${order.id}`);
      setOrderItems(data.items || []);
    } catch { setOrderItems([]); }
  };

  const updateStatus = async (orderId, status, payment_status) => {
    setUpdating(true);
    try {
      await API.put(`/orders/${orderId}/status`, { status, payment_status });
      toast.success('Order updated!');
      setSelectedOrder(prev => ({ ...prev, status, payment_status }));
      fetchOrders();
    } catch { toast.error('Update failed'); } finally { setUpdating(false); }
  };

  const pages = Math.ceil(total / 15);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Orders <span className="text-gray-400 text-base font-normal">({total})</span></h2>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Order #', 'Customer', 'Amount', 'Status', 'Payment', 'Date', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr> :
              orders.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr> :
              orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-800">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{order.user_name}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600">${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>{order.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewOrder(order)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded text-sm font-medium ${page === i + 1 ? 'bg-blue-500 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Order #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">Customer</p><p className="font-medium">{selectedOrder.user_name}</p></div>
                <div><p className="text-gray-500">Total</p><p className="font-bold text-blue-600">${parseFloat(selectedOrder.total_amount).toFixed(2)}</p></div>
                <div><p className="text-gray-500">Date</p><p className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</p></div>
                <div><p className="text-gray-500">Payment</p><p className={`font-medium capitalize ${selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedOrder.payment_status}</p></div>
              </div>
              {selectedOrder.shipping_address && <div className="text-sm"><p className="text-gray-500 mb-1">Shipping Address</p><p className="bg-gray-50 p-2 rounded-lg">{selectedOrder.shipping_address}</p></div>}

              {/* Order Items */}
              {orderItems.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 mb-2 text-sm">Items</p>
                  <div className="space-y-2">
                    {orderItems.map(item => {
                      const img = item.image?.startsWith('/uploads') ? `http://localhost:5000${item.image}` : (item.image || 'https://via.placeholder.com/50');
                      return (
                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                          <img src={img} alt={item.name} className="w-10 h-10 object-contain rounded" />
                          <div className="flex-1 text-sm"><p className="font-medium">{item.name}</p><p className="text-gray-500">x{item.quantity}</p></div>
                          <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order Status</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue={selectedOrder.status}
                    onChange={e => updateStatus(selectedOrder.id, e.target.value, selectedOrder.payment_status)}>
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue={selectedOrder.payment_status}
                    onChange={e => updateStatus(selectedOrder.id, selectedOrder.status, e.target.value)}>
                    {['pending', 'paid', 'failed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

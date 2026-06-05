import React, { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const statusColors = { pending: 'bg-yellow-100 text-yellow-700', contacted: 'bg-blue-100 text-blue-700', closed: 'bg-gray-100 text-gray-600' };

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await API.get(`/inquiries?${params}`);
      setInquiries(data.inquiries); setTotal(data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchInquiries(); }, [page, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/inquiries/${id}/status`, { status });
      toast.success('Status updated');
      setSelected(prev => prev ? { ...prev, status } : null);
      fetchInquiries();
    } catch { toast.error('Failed to update'); }
  };

  const pages = Math.ceil(total / 15);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Supplier Inquiries</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage quote requests from homepage</p>
        </div>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['#', 'Item Needed', 'Qty', 'User', 'Status', 'Date', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr> :
               inquiries.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No inquiries yet</td></tr> :
               inquiries.map(inq => (
                <tr key={inq.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">#{inq.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{inq.item_name}</td>
                  <td className="px-4 py-3 text-gray-600">{inq.quantity} {inq.unit}</td>
                  <td className="px-4 py-3">
                    {inq.user_name ? <span className="text-gray-700">{inq.user_name}</span> : <span className="text-gray-400 text-xs">Guest</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[inq.status]}`}>{inq.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(inq.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(inq)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
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

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Inquiry #{selected.id}</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500 text-xs mb-1">Item Needed</p><p className="font-semibold">{selected.item_name}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500 text-xs mb-1">Quantity</p><p className="font-semibold">{selected.quantity} {selected.unit}</p></div>
                <div className="bg-gray-50 rounded-lg p-3 col-span-2"><p className="text-gray-500 text-xs mb-1">Details</p><p className="text-sm">{selected.details || 'No details provided'}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500 text-xs mb-1">Customer</p><p className="font-semibold text-sm">{selected.user_name || 'Guest'}</p>{selected.user_email && <p className="text-xs text-gray-500">{selected.user_email}</p>}</div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500 text-xs mb-1">Date</p><p className="font-semibold text-sm">{new Date(selected.created_at).toLocaleDateString()}</p></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <div className="flex gap-2">
                  {['pending', 'contacted', 'closed'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors border ${selected.status === s ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;

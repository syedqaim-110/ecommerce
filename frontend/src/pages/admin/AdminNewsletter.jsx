import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, X } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminNewsletter = () => {
  const [data, setData] = useState({ subscribers: [], total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: d } = await API.get(`/newsletter?page=${page}&limit=20`);
      setData(d);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page]);

  const sendBulk = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data: res } = await API.post('/newsletter/send-bulk', emailForm);
      toast.success(res.message);
      setShowEmail(false);
      setEmailForm({ subject: '', message: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const pages = Math.ceil(data.total / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Newsletter</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage subscribers and send campaigns</p>
        </div>
        <button onClick={() => setShowEmail(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Send className="w-4 h-4" /> Send Email
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-800">{data.total}</p><p className="text-sm text-gray-500">Total Subscribers</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Mail className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-gray-800">{data.active}</p><p className="text-sm text-gray-500">Active Subscribers</p></div>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm">Subscribers List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Email', 'Status', 'Subscribed On'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={3} className="text-center py-12 text-gray-400">Loading...</td></tr> :
               data.subscribers.length === 0 ? <tr><td colSpan={3} className="text-center py-12 text-gray-400">No subscribers yet</td></tr> :
               data.subscribers.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.is_active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(sub.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
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

      {/* Send Email Modal */}
      {showEmail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Send Newsletter Email</h3>
              <button onClick={() => setShowEmail(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={sendBulk} className="p-5 space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                📧 This will send to <strong>{data.active} active subscribers</strong>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject..." value={emailForm.subject} onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (HTML supported) *</label>
                <textarea required rows={6} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Write your email message here... (HTML is supported)" value={emailForm.message} onChange={e => setEmailForm({ ...emailForm, message: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEmail(false)} className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={sending} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send to All'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;

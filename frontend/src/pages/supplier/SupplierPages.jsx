import React, { useState, useEffect } from 'react';
import { Eye, Send, X, Star, AlertCircle, CheckCircle } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const statusColors = { pending:'bg-yellow-100 text-yellow-700', processing:'bg-blue-100 text-blue-700', shipped:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' };

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    API.get(`/suppliers/my-orders?status=${statusFilter}`).then(({ data }) => { setOrders(data.orders || []); setLoading(false); }).catch(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Orders</h2>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Order #','Customer','Product','Qty','Amount','Status','Date'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr> :
               orders.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr> :
               orders.map(o => (
                <tr key={`${o.id}-${o.product_name}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-700">#{o.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{o.customer_name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{o.product_name}</td>
                  <td className="px-4 py-3 text-center">{o.quantity}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">${parseFloat(o.price * o.quantity).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[o.status]}`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const SupplierMessages = () => {
  const [data, setData] = useState({ messages: [], unread: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try { const { data: d } = await API.get('/suppliers/messages'); setData(d); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const sendReply = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await API.put(`/suppliers/messages/${selected.id}/reply`, { admin_reply: reply });
      toast.success('Reply sent to customer!');
      setReply('');
      setSelected(prev => ({ ...prev, admin_reply: reply }));
      fetchMessages();
    } catch { toast.error('Failed to send reply'); }
    finally { setSending(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Customer Messages</h2>
        {data.unread > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{data.unread} new</span>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Messages List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">Inbox</div>
          {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
           data.messages.length === 0 ? <div className="p-8 text-center text-gray-400">No messages yet</div> :
           data.messages.map(msg => (
            <div key={msg.id} onClick={() => setSelected(msg)}
              className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!msg.is_read ? 'bg-blue-50/40' : ''} ${selected?.id === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {!msg.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    <p className={`text-sm truncate ${!msg.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.sender_name}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{msg.subject}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</p>
                  {msg.admin_reply && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">Replied</span>}
                </div>
              </div>
            </div>
           ))}
        </div>
        {/* Message Detail */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-center py-12">
              <div><p className="text-gray-400 text-sm">Select a message to view</p></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-800">{selected.subject}</h3>
                <p className="text-xs text-gray-400 mt-0.5">From: {selected.sender_name} ({selected.sender_email}) · {new Date(selected.created_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-sm text-gray-700">{selected.message}</p></div>
              {selected.admin_reply && (
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Your previous reply:</p>
                  <p className="text-sm text-gray-700">{selected.admin_reply}</p>
                </div>
              )}
              <form onSubmit={sendReply} className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">Reply to customer</label>
                <textarea required rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Type your reply... (will be emailed to customer)" value={reply} onChange={e => setReply(e.target.value)} />
                <button type="submit" disabled={sending} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                  <Send className="w-4 h-4" />{sending ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────
export const SupplierReports = () => {
  const [data, setData] = useState({ reviews: [], complaints: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reviews');

  useEffect(() => {
    API.get('/suppliers/reports').then(({ data: d }) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const avgRating = data.reviews.length ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length).toFixed(1) : 0;
  const statusColors2 = { open:'bg-red-100 text-red-700', in_progress:'bg-yellow-100 text-yellow-700', resolved:'bg-green-100 text-green-700', closed:'bg-gray-100 text-gray-600' };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Customer Reports</h2>
        <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-sm">{avgRating}</span>
          <span className="text-xs text-gray-400">avg ({data.reviews.length} reviews)</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[['reviews', `Reviews (${data.reviews.length})`], ['complaints', `Complaints (${data.complaints.length})`]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{l}</button>
        ))}
      </div>

      {loading ? <div className="bg-white rounded-xl border border-gray-200 h-40 animate-pulse" /> : (
        <div className="space-y-3">
          {tab === 'reviews' && (
            data.reviews.length === 0 ? <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">No reviews yet</div> :
            data.reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{r.customer_name}</p>
                    <p className="text-xs text-gray-400">{r.product_name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                    <span className="text-xs text-gray-500 ml-1">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))
          )}
          {tab === 'complaints' && (
            data.complaints.length === 0 ? <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">No complaints</div> :
            data.complaints.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{c.subject}</p>
                    <p className="text-xs text-gray-400">{c.customer_name} · {c.product_name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors2[c.status]}`}>{c.status}</span>
                </div>
                <p className="text-sm text-gray-600">{c.description}</p>
                {c.admin_notes && <div className="mt-2 bg-blue-50 rounded p-2 text-xs text-blue-700"><strong>Admin:</strong> {c.admin_notes}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────
export const SupplierProfile = () => {
  const [profile, setProfile] = useState({ company_name:'', description:'', country:'', city:'', address:'', phone:'', website:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    API.get('/suppliers/me').then(({ data }) => { setProfile({ company_name:data.company_name||'', description:data.description||'', country:data.country||'', city:data.city||'', address:data.address||'', phone:data.phone||data.user_phone||'', website:data.website||'' }); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(profile).forEach(([k, v]) => fd.append(k, v));
      if (logoFile) fd.append('logo', logoFile);
      await API.put('/suppliers/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile updated!');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">My Supplier Profile</h2>
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label><input type="file" accept="image/*" className="w-full text-sm" onChange={e => setLogoFile(e.target.files[0])} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label><input required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={profile.company_name} onChange={e => setProfile({ ...profile, company_name: e.target.value })} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label><textarea rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Country</label><input className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea rows={2} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><input className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })} /></div>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Profile'}</button>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { MessageSquare, Eye, Trash2, X, Send, Check } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filter !== '') params.set('is_read', filter);
      const { data } = await API.get(`/messages?${params}`);
      setMessages(data.messages); setTotal(data.total); setUnread(data.unread);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, [page, filter]);

  const openMessage = async (msg) => {
    setSelected(msg); setReply(msg.admin_reply || '');
    if (!msg.is_read) {
      try { await API.put(`/messages/${msg.id}/read`); fetchMessages(); } catch {}
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setReplying(true);
    try {
      await API.put(`/messages/${selected.id}/reply`, { admin_reply: reply });
      toast.success('Reply sent!');
      setSelected(prev => ({ ...prev, admin_reply: reply, is_read: 1 }));
      fetchMessages();
    } catch { toast.error('Failed to send reply'); }
    finally { setReplying(false); }
  };

  const deleteMsg = async (id) => {
    if (!confirm('Delete this message?')) return;
    try { await API.delete(`/messages/${id}`); toast.success('Deleted'); setSelected(null); fetchMessages(); }
    catch { toast.error('Failed'); }
  };

  const pages = Math.ceil(total / 15);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          {unread > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unread} new</span>}
        </div>
        <div className="flex gap-2">
          {[['','All'],['0','Unread'],['1','Read']].map(([v,l]) => (
            <button key={v} onClick={() => { setFilter(v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===v?'bg-blue-500 text-white':'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['','From','Subject','Date','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr> :
               messages.length===0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No messages</td></tr> :
               messages.map(msg => (
                <tr key={msg.id} className={`hover:bg-gray-50 ${!msg.is_read?'bg-blue-50/30':''}`}>
                  <td className="px-3 py-3">{!msg.is_read&&<div className="w-2 h-2 bg-blue-500 rounded-full"/>}</td>
                  <td className="px-4 py-3">
                    <p className={`text-sm ${!msg.is_read?'font-semibold text-gray-900':'text-gray-700'}`}>{msg.sender_name||msg.user_name||'Guest'}</p>
                    <p className="text-xs text-gray-400">{msg.sender_email}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]"><p className={`truncate text-sm ${!msg.is_read?'font-medium':''}`}>{msg.subject}</p></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(msg.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {msg.admin_reply
                      ? <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Replied</span>
                      : <span className={`text-xs px-2 py-0.5 rounded-full ${msg.is_read?'bg-gray-100 text-gray-600':'bg-blue-100 text-blue-700'}`}>{msg.is_read?'Read':'New'}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openMessage(msg)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Eye className="w-4 h-4"/></button>
                      <button onClick={() => deleteMsg(msg.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages>1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {[...Array(pages)].map((_,i)=>(
              <button key={i} onClick={()=>setPage(i+1)} className={`w-8 h-8 rounded text-sm font-medium ${page===i+1?'bg-blue-500 text-white':'border border-gray-300 hover:bg-gray-50'}`}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-gray-800 truncate flex-1">{selected.subject}</h3>
              <button onClick={()=>setSelected(null)}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">From</p><p className="font-medium">{selected.sender_name}</p><p className="text-xs text-gray-400">{selected.sender_email}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Date</p><p className="font-medium">{new Date(selected.created_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</p></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs font-medium text-gray-500 mb-2">Message</p><p className="text-sm text-gray-800 leading-relaxed">{selected.message}</p></div>

              {selected.admin_reply && (
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1"><Check className="w-3 h-3"/>Your Reply (sent to customer)</p>
                  <p className="text-sm text-gray-800">{selected.admin_reply}</p>
                </div>
              )}

              <form onSubmit={sendReply}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{selected.admin_reply ? 'Update Reply' : 'Reply to Customer'}</label>
                <textarea rows={4} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                  placeholder="Type your reply... (will be emailed to customer)" value={reply} onChange={e=>setReply(e.target.value)} />
                <div className="flex gap-3">
                  <button type="button" onClick={()=>deleteMsg(selected.id)} className="flex items-center gap-1.5 border border-red-300 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5"/> Delete</button>
                  <button type="submit" disabled={replying} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"><Send className="w-4 h-4"/>{replying?'Sending...':'Send Reply'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;

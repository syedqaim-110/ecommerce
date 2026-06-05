import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const { t } = useSettings();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', sender_name: user?.name||'', sender_email: user?.email||'' });
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    if (!user) return;
    try { const { data } = await API.get('/messages/my'); setMessages(data); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await API.post('/messages', form);
      toast.success('Message sent!');
      setShowForm(false);
      setForm({ ...form, subject: '', message: '' });
      fetchMessages();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark">{t('myMessages')}</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Send className="w-4 h-4" /> {t('sendMessage')}
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div> :
       messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-shade-border">
          <MessageSquare className="w-14 h-14 text-secondary mx-auto mb-3" />
          <p className="text-dark font-medium mb-1">{t('noMessages')}</p>
          <p className="text-secondary text-sm mb-4">Send us a message and we'll get back to you</p>
          <button onClick={() => setShowForm(true)} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">{t('sendMessage')}</button>
        </div>
       ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white rounded-xl border border-shade-border p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-semibold text-dark">{msg.subject}</h3>
                  <p className="text-xs text-secondary mt-0.5">{new Date(msg.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${msg.is_read?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                  {msg.is_read ? t('read') : t('unread')}
                </span>
              </div>
              <p className="text-secondary text-sm">{msg.message}</p>
              {msg.admin_reply && (
                <div className="mt-3 bg-primary-light border-l-4 border-primary rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary mb-1">Support Reply:</p>
                  <p className="text-sm text-dark">{msg.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
       )}

      {/* Send Message Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-5 border-b border-shade-border flex items-center justify-between">
              <h3 className="font-bold text-dark">{t('sendMessage')}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-secondary" /></button>
            </div>
            <form onSubmit={sendMessage} className="p-5 space-y-4">
              {!user && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-secondary mb-1">Your Name</label><input required className="w-full border border-shade-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" value={form.sender_name} onChange={e=>setForm({...form,sender_name:e.target.value})} /></div>
                  <div><label className="block text-xs font-medium text-secondary mb-1">Your Email</label><input type="email" required className="w-full border border-shade-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" value={form.sender_email} onChange={e=>setForm({...form,sender_email:e.target.value})} /></div>
                </div>
              )}
              <div><label className="block text-xs font-medium text-secondary mb-1">{t('subject')}</label><input required className="w-full border border-shade-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="What's your inquiry about?" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} /></div>
              <div><label className="block text-xs font-medium text-secondary mb-1">{t('message')}</label><textarea required rows={5} className="w-full border border-shade-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Describe your issue or question..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} /></div>
              <div className="flex gap-3">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 border border-shade-border py-2.5 rounded-lg text-sm font-medium text-secondary hover:bg-shade">Cancel</button>
                <button type="submit" disabled={sending} className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" />{sending?'Sending...':t('sendMessage')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;

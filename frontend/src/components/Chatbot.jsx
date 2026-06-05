import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle, ChevronRight } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;

const ChatMessage = ({ msg }) => {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex gap-2 mb-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isBot ? 'bg-primary' : 'bg-green-500'}`}>
        {isBot ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[80%] ${isBot ? '' : 'items-end'} flex flex-col`}>
        <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
          isBot ? 'bg-white border border-shade-border text-dark rounded-tl-none' : 'bg-primary text-white rounded-tr-none'
        }`}>
          {msg.text}
        </div>
        <span className="text-[10px] text-secondary mt-1 px-1">{msg.time}</span>
      </div>
    </div>
  );
};

const ComplaintForm = ({ onClose, onSubmit }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: '', description: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/bot/complaint', form);
      toast.success('Complaint filed! We will respond within 24-48 hours.');
      onSubmit();
      onClose();
    } catch { toast.error('Failed to file complaint'); }
    finally { setLoading(false); }
  };
  return (
    <div className="bg-white border border-shade-border rounded-xl p-4 mx-2 mb-2">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-orange-500" />
        <span className="font-medium text-sm text-dark">File a Complaint</span>
        <button onClick={onClose} className="ml-auto"><X className="w-4 h-4 text-secondary" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input required placeholder="Subject" className="w-full border border-shade-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
          value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
        <textarea required rows={3} placeholder="Describe your issue..." className="w-full border border-shade-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary resize-none"
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 border border-shade-border py-1.5 rounded-lg text-xs text-secondary hover:bg-shade">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-1.5 rounded-lg text-xs font-medium disabled:opacity-50">{loading ? 'Sending...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
};

const Chatbot = () => {
  const { user } = useAuth();
  const { t } = useSettings();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hello! 👋 I'm your AI assistant. How can I help you today?\n\n• 🛍️ Browse products\n• 📦 Track orders\n• 💬 Contact supplier\n• ❓ Help & FAQ\n• 📝 File a complaint`, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), quick_replies: ['Browse Products', 'Track my order', 'File a Complaint', 'Help & FAQ'] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Listen for external open events
    const handler = () => setOpen(true);
    window.addEventListener('openChatbot', handler);
    return () => window.removeEventListener('openChatbot', handler);
  }, []);

  useEffect(() => {
    if (!open && messages.length > 1) setUnread(prev => prev + 1);
    if (open) setUnread(0);
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    const now = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    
    setMessages(prev => [...prev, { role: 'user', text: userText, time: now }]);
    setInput('');
    setLoading(true);

    // Handle complaint trigger
    if (/complaint|complain|file a complaint/i.test(userText)) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: 'I\'ll help you file a complaint. Please fill in the form below:', time: now, quick_replies: [] }]);
        setShowComplaint(true);
        setLoading(false);
      }, 500);
      return;
    }

    // Handle contact admin
    if (/contact admin|admin support|human|agent/i.test(userText)) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: '👨‍💼 Connecting you to admin support...\n\nPlease go to the Messages section to send a direct message to our admin team. They will respond within 2-4 hours.', time: now, quick_replies: ['Go to Messages', 'File Complaint'] }]);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const { data } = await API.post('/bot/chat', { message: userText, session_id: SESSION_ID });
      const botTime = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      setMessages(prev => [...prev, { role: 'bot', text: data.text, time: botTime, quick_replies: data.quick_replies || [] }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I\'m having trouble responding right now. Please try again or contact our support team.', time: now, quick_replies: ['Contact Support'] }]);
    } finally { setLoading(false); }
  };

  const handleQuickReply = (reply) => {
    if (reply === 'File Complaint') { setShowComplaint(true); return; }
    if (reply === 'Go to Messages') { window.location.href = '/messages'; return; }
    if (reply === 'View Orders' || reply === 'View All Orders') { window.location.href = '/orders'; return; }
    if (reply === 'Browse Products' || reply === 'Browse All') { window.location.href = '/products'; return; }
    if (reply === 'Electronics') { window.location.href = '/products?category=electronics'; return; }
    if (reply === 'Login') { window.location.href = '/login'; return; }
    if (reply === 'Register') { window.location.href = '/register'; return; }
    sendMessage(reply);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => { setOpen(!open); setUnread(0); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{unread}</span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-shade rounded-2xl shadow-2xl border border-shade-border flex flex-col overflow-hidden" style={{height:'480px'}}>
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">AI Assistant</p>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/><span className="text-xs text-white/80">Online</span></div>
            </div>
            <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-white/80 hover:text-white"/></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {messages.map((msg, i) => (
              <div key={i}>
                <ChatMessage msg={msg} />
                {msg.quick_replies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-9 mb-2">
                    {msg.quick_replies.map(qr => (
                      <button key={qr} onClick={() => handleQuickReply(qr)}
                        className="flex items-center gap-1 bg-white border border-primary text-primary text-xs px-2.5 py-1 rounded-full hover:bg-primary hover:text-white transition-colors">
                        {qr}<ChevronRight className="w-3 h-3"/>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-white"/></div>
                <div className="bg-white border border-shade-border rounded-xl rounded-tl-none px-3 py-2 flex gap-1">
                  {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Complaint Form */}
          {showComplaint && <ComplaintForm onClose={() => setShowComplaint(false)} onSubmit={() => {
            setMessages(prev => [...prev, { role: 'bot', text: '✅ Your complaint has been filed successfully. Our admin team will review it and get back to you within 24-48 hours.\n\nIs there anything else I can help you with?', time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), quick_replies: ['Help & FAQ', 'Contact Admin'] }]);
          }}/>}

          {/* Input */}
          <div className="p-3 bg-white border-t border-shade-border">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-shade-border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="w-9 h-9 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0">
                <Send className="w-4 h-4"/>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Search, HelpCircle, Truck, CreditCard, RotateCcw, User, Package } from 'lucide-react';
import API from '../utils/api';
import { useSettings } from '../context/SettingsContext';

const categoryIcons = { faq: HelpCircle, shipping: Truck, payment: CreditCard, returns: RotateCcw, account: User, other: Package };
const categoryColors = { faq:'bg-blue-100 text-blue-600', shipping:'bg-green-100 text-green-600', payment:'bg-purple-100 text-purple-600', returns:'bg-orange-100 text-orange-600', account:'bg-pink-100 text-pink-600', other:'bg-gray-100 text-gray-600' };

const HelpPage = () => {
  const { id } = useParams();
  const { t } = useSettings();
  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openArticle, setOpenArticle] = useState(id ? parseInt(id) : null);

  useEffect(() => {
    API.get('/settings/help').then(({ data }) => { setArticles(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (id) {
      API.get('/settings/help').then(({ data }) => {
        const found = data.find(a => a.id === parseInt(id));
        setArticle(found || null);
        setArticles(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  const categories = ['all', ...new Set(articles.map(a => a.category))];
  const filtered = articles.filter(a => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // If specific article via URL
  if (id && article) {
    const Icon = categoryIcons[article.category] || HelpCircle;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-xs text-secondary mb-6">
          <Link to="/" className="hover:text-primary">Home</Link><ChevronRight className="w-3 h-3" />
          <Link to="/help" className="hover:text-primary">Help Center</Link><ChevronRight className="w-3 h-3" />
          <span className="text-dark capitalize">{article.category}</span>
        </nav>
        <div className="bg-white rounded-xl border border-shade-border p-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColors[article.category]}`}>
            <Icon className="w-3.5 h-3.5" /> <span className="capitalize">{article.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-dark mb-6">{article.title}</h1>
          <div className="text-secondary leading-relaxed text-sm whitespace-pre-wrap">{article.content}</div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-secondary text-sm mb-3">Was this helpful?</p>
          <div className="flex justify-center gap-3">
            <button className="px-5 py-2 border border-shade-border rounded-lg text-sm hover:bg-shade transition-colors">👍 Yes</button>
            <button className="px-5 py-2 border border-shade-border rounded-lg text-sm hover:bg-shade transition-colors">👎 No</button>
          </div>
          <Link to="/messages" className="text-primary text-sm hover:underline block mt-4">Still need help? Contact Support</Link>
        </div>
      </div>
    );
  }

  // If 404 - id provided but not found
  if (id && !loading && !article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <HelpCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-dark mb-2">Article not found</h2>
        <p className="text-secondary text-sm mb-6">The help article you're looking for doesn't exist.</p>
        <Link to="/help" className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors inline-block">Browse Help Center</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">{t('helpCenter')}</h1>
        <p className="text-secondary">Find answers to common questions</p>
        <div className="max-w-md mx-auto mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input type="text" placeholder="Search help articles..." className="w-full pl-10 pr-4 py-3 border border-shade-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap justify-center mb-6">
        {categories.map(cat => {
          const Icon = categoryIcons[cat] || HelpCircle;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${activeCategory===cat?'bg-primary text-white':'bg-white border border-shade-border text-secondary hover:text-primary hover:border-primary'}`}>
              <Icon className="w-3.5 h-3.5" />{cat}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-secondary">No articles found. <Link to="/messages" className="text-primary hover:underline">Contact support</Link></p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(art => {
            const Icon = categoryIcons[art.category] || HelpCircle;
            const isOpen = openArticle === art.id;
            return (
              <div key={art.id} className="bg-white rounded-xl border border-shade-border overflow-hidden hover:shadow-sm transition-shadow">
                <button onClick={() => setOpenArticle(isOpen ? null : art.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[art.category]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-dark text-sm">{art.title}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-secondary transition-transform flex-shrink-0 ${isOpen?'rotate-180':''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1">
                    <div className="pl-11">
                      <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">{art.content}</p>
                      <Link to={`/help/${art.id}`} className="text-primary text-xs hover:underline mt-3 inline-block">Read full article →</Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Card */}
      <div className="mt-8 bg-primary rounded-xl p-6 text-white text-center">
        <h3 className="font-bold text-lg mb-1">Still need help?</h3>
        <p className="text-white/80 text-sm mb-4">Our support team is available 24/7</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/messages" className="bg-white text-primary px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">Contact Admin</Link>
          <button onClick={() => window.dispatchEvent(new Event('openChatbot'))} className="border border-white text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">Chat with AI</button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

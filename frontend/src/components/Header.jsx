import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, ShoppingCart, Menu, ChevronDown, LogOut, Settings, Package, MessageSquare, X, ChevronRight, HelpCircle } from 'lucide-react';
import logo from '../assets/Layout/Brand/logo-colored.png';
import flagDE from '../assets/Layout1/Image/flags/DE@2x.png';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import API from '../utils/api';

// Dropdown wrapper
const Dropdown = ({ trigger, children, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger(open)}</div>
      {open && <div className={`absolute z-50 bg-white border border-shade-border rounded-xl shadow-xl ${className}`} onClick={() => setOpen(false)}>{children}</div>}
    </div>
  );
};

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { language, currency, languages, currencies, changeLanguage, changeCurrency, t } = useSettings();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All category');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [helpArticles, setHelpArticles] = useState([]);
  const [shipCountries] = useState([
    {code:'US', name:'United States'}, {code:'GB', name:'United Kingdom'},
    {code:'DE', name:'Germany'}, {code:'AE', name:'UAE'},
    {code:'PK', name:'Pakistan'}, {code:'SA', name:'Saudi Arabia'},
    {code:'CN', name:'China'}, {code:'FR', name:'France'},
  ]);
  const [shipTo, setShipTo] = useState({code:'DE', name:'Germany'});
  const categories = ['All category','Electronics','Home & Outdoor','Clothing','Sports','Books'];
  const flagUrl = (code) => `https://flagcdn.com/w40/${(code||'us').toLowerCase()}.png`;

  useEffect(() => {
    API.get('/settings/help').then(({data}) => setHelpArticles(data)).catch(()=>{});
    if (user?.role === 'admin') {
      API.get('/messages/unread-count').then(({data}) => setUnreadMsg(data.count)).catch(()=>{});
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search);
    if (category !== 'All category') params.set('category', category.toLowerCase().replace(/\s+&\s+/g,'-').replace(/\s+/g,'-'));
    navigate(`/products?${params}`);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="bg-white border-b border-shade-border sticky top-0 z-50 shadow-sm" dir="ltr">
      {/* ── Top Row ── */}
      <div className="container py-3 flex items-center gap-4">
        <Link to="/" className="flex-shrink-0"><img src={logo} alt="Brand" className="h-[46px]" /></Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex border-2 border-primary rounded-lg overflow-hidden">
          <input type="text" placeholder={t('search')} className="flex-1 px-4 py-2 outline-none text-sm"
            value={search} onChange={e => setSearch(e.target.value)} />
          <Dropdown
            trigger={(open) => (
              <button type="button" className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-shade text-sm whitespace-nowrap h-full border-l border-shade-border">
                <span>{category}</span><ChevronDown className="w-3 h-3" />
              </button>
            )}
            className="top-full right-0 w-44 py-1 mt-1">
            {categories.map(c => (
              <div key={c} onClick={() => setCategory(c)} className="px-4 py-2 text-sm hover:bg-shade hover:text-primary cursor-pointer transition-colors">{c}</div>
            ))}
          </Dropdown>
          <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 font-medium text-sm transition-colors">{t('search')}</button>
        </form>

        {/* Right Icons */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Profile */}
          {user ? (
            <Dropdown
              trigger={(open) => (
                <button className="flex flex-col items-center text-secondary hover:text-primary transition-colors">
                  <User className="w-5 h-5 mb-0.5" />
                  <span className="text-[11px] hidden sm:block truncate max-w-[60px]">{user.name.split(' ')[0]}</span>
                </button>
              )}
              className="right-0 top-full mt-2 w-52 py-2">
              <div className="px-4 py-2 border-b border-shade-border">
                <p className="font-semibold text-sm text-dark truncate">{user.name}</p>
                <p className="text-xs text-secondary truncate">{user.email}</p>
              </div>
              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-shade transition-colors"><Settings className="w-4 h-4" /> {t('profile')}</Link>
              <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-shade transition-colors"><Package className="w-4 h-4" /> {t('myOrders')}</Link>
              <Link to="/messages" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-shade transition-colors"><MessageSquare className="w-4 h-4" /> {t('myMessages')}</Link>
              {isAdmin && <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium hover:bg-primary-light transition-colors"><Settings className="w-4 h-4" /> {t('adminPanel')}</Link>}
              <hr className="my-1 border-shade-border" />
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"><LogOut className="w-4 h-4" /> {t('logout')}</button>
            </Dropdown>
          ) : (
            <Link to="/login" className="flex flex-col items-center text-secondary hover:text-primary transition-colors">
              <User className="w-5 h-5 mb-0.5" /><span className="text-[11px] hidden sm:block">{t('profile')}</span>
            </Link>
          )}

          {/* Messages */}
          <Link to={user?.role==='admin' ? '/admin/messages' : '/messages'} className="flex flex-col items-center text-secondary hover:text-primary transition-colors relative">
            <div className="relative">
              <MessageSquare className="w-5 h-5 mb-0.5" />
              {unreadMsg > 0 && <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{unreadMsg}</span>}
            </div>
            <span className="text-[11px] hidden sm:block">{t('messages')}</span>
          </Link>

          {/* Orders/Wishlist */}
          <Link to="/orders" className="flex flex-col items-center text-secondary hover:text-primary transition-colors">
            <Heart className="w-5 h-5 mb-0.5" /><span className="text-[11px] hidden sm:block">{t('orders')}</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex flex-col items-center text-secondary hover:text-primary transition-colors relative">
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-0.5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cartCount>9?'9+':cartCount}</span>}
            </div>
            <span className="text-[11px] hidden sm:block">{t('myCart')}</span>
          </Link>

          <button className="md:hidden text-secondary" onClick={() => setMobileMenu(!mobileMenu)}><Menu className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex border-2 border-primary rounded-lg overflow-hidden">
          <input type="text" placeholder={t('search')} className="flex-1 px-3 py-2 outline-none text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" className="bg-primary text-white px-4 py-2 text-sm">{t('search')}</button>
        </form>
      </div>

      {/* ── Bottom Nav ── */}
      <div className="border-t border-shade-border hidden md:block">
        <div className="container py-2.5 flex items-center justify-between">
          <nav className="flex items-center gap-5 text-sm font-medium text-dark">
            <Link to="/products" className="flex items-center gap-1.5 hover:text-primary transition-colors"><Menu className="w-4 h-4" /> {t('allCategory')}</Link>
            <Link to="/products?sort=newest" className="hover:text-primary transition-colors">{t('hotOffers')}</Link>
            <Link to="/products?category=electronics" className="hover:text-primary transition-colors">Electronics</Link>
            <Link to="/products?category=home-outdoor" className="hover:text-primary transition-colors">Home & Outdoor</Link>
            <Link to="/products?category=clothing" className="hover:text-primary transition-colors">Clothing</Link>

            {/* Help Dropdown — Dynamic */}
            <Dropdown
              trigger={(open) => (
                <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors select-none">
                  <HelpCircle className="w-4 h-4" /> Help <ChevronDown className="w-3 h-3" />
                </div>
              )}
              className="top-full left-0 mt-1 w-72 py-2">
              <div className="px-4 py-2 border-b border-shade-border">
                <p className="font-semibold text-sm text-dark">{t('customerService')}</p>
              </div>
              {helpArticles.length ? helpArticles.map(a => (
                <Link key={a.id} to={`/help/${a.id}`} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-shade hover:text-primary transition-colors group">
                  <span className="line-clamp-1 flex-1">{a.title}</span>
                  <ChevronRight className="w-3 h-3 text-secondary group-hover:text-primary flex-shrink-0" />
                </Link>
              )) : [
                {id:1, title:'How to place an order?'},{id:2, title:'Payment methods'},{id:3, title:'Shipping info'},{id:4, title:'Return policy'}
              ].map(a => (
                <Link key={a.id} to="/help" className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-shade hover:text-primary transition-colors group">
                  <span>{a.title}</span><ChevronRight className="w-3 h-3 text-secondary" />
                </Link>
              ))}
              <div className="border-t border-shade-border mt-1 pt-1">
                <Link to="/help" className="flex items-center justify-between px-4 py-2.5 text-sm text-primary font-medium hover:bg-primary-light transition-colors">
                  {t('helpCenter')} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </Dropdown>
          </nav>

          {/* Right: Language + Currency + Ship To */}
          <div className="flex items-center gap-4 text-sm font-medium text-dark">
            {/* Language + Currency combo */}
            <Dropdown
              trigger={(open) => (
                <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors select-none">
                  <span>{language.name}, {currency.code}</span><ChevronDown className="w-3 h-3 text-secondary" />
                </div>
              )}
              className="right-0 top-full mt-1 w-80 py-2">
              <div className="grid grid-cols-2 divide-x divide-shade-border">
                <div>
                  <p className="px-3 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wide border-b border-shade-border">Language</p>
                  {(languages.length ? languages : [{code:'en',name:'English',flag_code:'US'},{code:'ur',name:'Urdu',flag_code:'PK'},{code:'ar',name:'Arabic',flag_code:'SA'},{code:'fr',name:'French',flag_code:'FR'},{code:'de',name:'German',flag_code:'DE'}]).map(lang => (
                    <div key={lang.code} onClick={() => changeLanguage(lang)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-shade hover:text-primary transition-colors ${language.code===lang.code?'text-primary font-medium bg-primary-light':''}`}>
                      <img src={flagUrl(lang.flag_code)} alt={lang.code} className="w-5 h-3.5 rounded-sm object-cover flex-shrink-0"
                        onError={e=>{e.target.style.display='none';}} />
                      {lang.name}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="px-3 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wide border-b border-shade-border">Currency</p>
                  {(currencies.length ? currencies : [{code:'USD',name:'US Dollar',symbol:'$'},{code:'EUR',name:'Euro',symbol:'€'},{code:'GBP',name:'Pound',symbol:'£'},{code:'PKR',name:'PKR',symbol:'₨'},{code:'AED',name:'Dirham',symbol:'د.إ'}]).map(curr => (
                    <div key={curr.code} onClick={() => changeCurrency(curr)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer hover:bg-shade hover:text-primary transition-colors ${currency.code===curr.code?'text-primary font-medium bg-primary-light':''}`}>
                      <span className="font-bold w-6">{curr.symbol}</span> {curr.code}
                    </div>
                  ))}
                </div>
              </div>
            </Dropdown>

            {/* Ship To — Dynamic */}
            <Dropdown
              trigger={(open) => (
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors select-none">
                  <span>{t('shipTo')}</span>
                  <img src={flagUrl(shipTo.code)} alt={shipTo.code} className="w-5 h-3.5 rounded-sm object-cover"
                    onError={e=>{e.target.src=flagDE;}} />
                  <ChevronDown className="w-3 h-3 text-secondary" />
                </div>
              )}
              className="right-0 top-full mt-1 w-52 py-2">
              {shipCountries.map(c => (
                <div key={c.code} onClick={() => setShipTo(c)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-sm cursor-pointer hover:bg-shade hover:text-primary transition-colors ${shipTo.code===c.code?'text-primary font-medium bg-primary-light':''}`}>
                  <img src={flagUrl(c.code)} alt={c.code} className="w-5 h-3.5 rounded-sm object-cover"
                    onError={e=>{e.target.style.display='none';}} />
                  {c.name}
                </div>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenu && (
        <div className="md:hidden bg-white border-t border-shade-border px-4 py-3 space-y-1 text-sm font-medium">
          <Link to="/products" onClick={() => setMobileMenu(false)} className="block py-2 hover:text-primary border-b border-shade-border">{t('allCategory')}</Link>
          <Link to="/products?category=electronics" onClick={() => setMobileMenu(false)} className="block py-2 hover:text-primary border-b border-shade-border">Electronics</Link>
          <Link to="/products?category=home-outdoor" onClick={() => setMobileMenu(false)} className="block py-2 hover:text-primary border-b border-shade-border">Home & Outdoor</Link>
          <Link to="/orders" onClick={() => setMobileMenu(false)} className="block py-2 hover:text-primary border-b border-shade-border">{t('myOrders')}</Link>
          <Link to="/help" onClick={() => setMobileMenu(false)} className="block py-2 hover:text-primary border-b border-shade-border">{t('helpCenter')}</Link>
          {!user && <Link to="/login" onClick={() => setMobileMenu(false)} className="block py-2 text-primary font-semibold">{t('login')} / {t('register')}</Link>}
        </div>
      )}
    </header>
  );
};

export default Header;

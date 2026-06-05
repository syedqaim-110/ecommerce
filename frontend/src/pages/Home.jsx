import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Search, Package, Plane, ShieldCheck, ChevronUp } from 'lucide-react';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Apple, Play } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

import bannerImg from '../assets/Image/backgrounds/Banner-board-800x420 2.png';
import promo1 from '../assets/Image/backgrounds/Group 969.png';
import promo2 from '../assets/Image/backgrounds/Group 982.png';
import bgInquiry from '../assets/Image/backgrounds/image 107.png';
import maskBg1 from '../assets/Image/backgrounds/Mask group.png';
import maskBg2 from '../assets/Image/backgrounds/Mask group (1).png';
import homeBanner from '../assets/Image/backgrounds/image 98.png';
import techBanner from '../assets/Image/backgrounds/image 106.png';

import softChair from '../assets/Image/interior/1.png';
import sofaChair from '../assets/Image/interior/3.png';
import kitchenDish from '../assets/Image/interior/6.png';
import smartWatchInt from '../assets/Image/interior/7.png';
import kitchenMixer from '../assets/Image/interior/8.png';
import blenders from '../assets/Image/interior/9.png';
import homeAppliance from '../assets/Image/interior/image 89.png';
import coffeeMaker from '../assets/Image/interior/image 93.png';

import watchImg from '../assets/Image/tech/8.png';
import laptopImg from '../assets/Image/tech/image 23.png';
import goproImg from '../assets/Image/tech/image 29.png';
import headphonesImg from '../assets/Image/tech/image 34.png';
import canonImg from '../assets/Image/tech/image 85.png';
import smartWatchTech from '../assets/Image/tech/image 86.png';
import cameraTech from '../assets/Image/tech/6.png';
import headsetTech from '../assets/Image/tech/image 32.png';
import laptopPC from '../assets/Image/tech/image 33.png';

import flagAE from '../assets/Layout1/Image/flags/AE@2x.png';
import flagAU from '../assets/Layout1/Image/flags/icon.png';
import flagUS from '../assets/Layout1/Image/flags/US@2x.png';
import flagRU from '../assets/Layout1/Image/flags/RU@2x.png';
import flagIT from '../assets/Layout1/Image/flags/IT@2x.png';
import flagDK from '../assets/Layout1/Image/flags/DK@2x.png';
import flagFR from '../assets/Layout1/Image/flags/FR@2x.png';
import flagCN from '../assets/Layout1/Image/flags/CN@2x.png';
import flagGB from '../assets/Layout1/Image/flags/GB@2x.png';
import logo from '../assets/Layout/Brand/logo-colored.png';

const flagMap = {AE:flagAE,AU:flagAU,US:flagUS,RU:flagRU,IT:flagIT,DK:flagDK,FR:flagFR,CN:flagCN,GB:flagGB};
const iconMap = {Search:<Search className="w-5 h-5"/>,Package:<Package className="w-5 h-5"/>,Plane:<Plane className="w-5 h-5"/>,ShieldCheck:<ShieldCheck className="w-5 h-5"/>};
const staticDeals = [
  {name:'Smart watches',discount:'-25%',image:watchImg},
  {name:'Laptops',discount:'-15%',image:laptopImg},
  {name:'GoPro cameras',discount:'-40%',image:goproImg},
  {name:'Headphones',discount:'-25%',image:headphonesImg},
  {name:'Canon cameras',discount:'-25%',image:canonImg},
];
const staticServices = [
  {title:'Source from Industry Hubs',icon:'Search',image:maskBg1},
  {title:'Customize Your Products',icon:'Package',image:maskBg2},
  {title:'Fast, reliable shipping by ocean or air',icon:'Plane',image:bgInquiry},
  {title:'Product monitoring and inspection',icon:'ShieldCheck',image:techBanner},
];
const staticRegions = [
  {country_name:'Arabic Emirates',country_code:'AE',supplier_count:321},
  {country_name:'Australia',country_code:'AU',supplier_count:287},
  {country_name:'United States',country_code:'US',supplier_count:1032},
  {country_name:'Russia',country_code:'RU',supplier_count:543},
  {country_name:'Italy',country_code:'IT',supplier_count:219},
  {country_name:'Denmark',country_code:'DK',supplier_count:167},
  {country_name:'France',country_code:'FR',supplier_count:394},
  {country_name:'China',country_code:'CN',supplier_count:2341},
  {country_name:'Great Britain',country_code:'GB',supplier_count:876},
];

// ── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { user } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const cats = ["Automobiles","Clothes and wear","Home interiors","Computer and tech","Tools, equipments","Sports and outdoor","Animal and pets","Machinery tools","More category"];
  return (
    <section className="bg-white border border-shade-border rounded-lg mt-4 overflow-hidden">
      <div className="flex p-4 gap-4" style={{height:'390px'}}>
        <div className="w-52 flex-shrink-0 hidden lg:block">
          <ul className="space-y-0.5">
            {cats.map((c,i)=>(
              <li key={i} onClick={()=>navigate('/products')}
                className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${i===0?'bg-primary-light font-medium text-dark':'text-dark-light hover:bg-shade'}`}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="flex-1 relative rounded-lg p-8 flex flex-col justify-center bg-cover bg-no-repeat bg-center"
          style={{backgroundImage:`url("${bannerImg}")`}}>
          <div className="relative z-10 w-1/2">
            <h3 className="text-2xl font-normal text-dark mb-1">Latest trending</h3>
            <h2 className="text-[30px] font-bold text-dark leading-tight mb-5">Electronic items</h2>
            <Link to="/products?category=electronics" className="inline-block bg-white text-dark px-5 py-2 rounded-md font-medium hover:bg-shade transition-colors shadow-sm text-sm">{t('learnMore')}</Link>
          </div>
        </div>
        <div className="w-52 flex-shrink-0 flex-col gap-3 hidden lg:flex">
          <div className="bg-primary-light p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#C3D9FF] flex items-center justify-center text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <p className="text-dark text-xs">{user?`Hi, ${user.name.split(' ')[0]}`:'Hi, user'}</p>
                <p className="text-dark text-xs">let's get started</p>
              </div>
            </div>
            {!user ? (
              <>
                <Link to="/register" className="block w-full bg-primary hover:bg-primary-dark text-white py-1.5 rounded-md mb-2 text-xs font-medium text-center transition-colors">{t('joinNow')}</Link>
                <Link to="/login" className="block w-full bg-white text-primary py-1.5 rounded-md text-xs font-medium border border-shade-border hover:bg-shade text-center transition-colors">{t('login')}</Link>
              </>
            ) : (
              <Link to="/profile" className="block w-full bg-primary hover:bg-primary-dark text-white py-1.5 rounded-md text-xs font-medium text-center transition-colors">{t('profile')}</Link>
            )}
          </div>
          <div className="p-3 rounded-lg flex-1 text-white bg-cover bg-no-repeat bg-center cursor-pointer hover:opacity-90 transition-opacity" style={{backgroundImage:`url("${promo1}")`}}>
            <p className="text-xs font-normal leading-tight w-2/3">Get US $10 off with a new supplier</p>
          </div>
          <div className="p-3 rounded-lg flex-1 text-white bg-cover bg-no-repeat bg-center cursor-pointer hover:opacity-90 transition-opacity" style={{backgroundImage:`url("${promo2}")`}}>
            <p className="text-xs font-normal leading-tight w-2/3">Send quotes with supplier preferences</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Deals (Dynamic from DB) ───────────────────────────────────────────────────
const DealsSection = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [time, setTime] = useState({d:'04',h:'13',m:'34',s:'56'});
  const [dealData, setDealData] = useState(null);

  useEffect(()=>{ API.get('/deals/active').then(({data})=>{if(data)setDealData(data);}).catch(()=>{}); },[]);

  useEffect(()=>{
    const endTime = dealData?.end_time ? new Date(dealData.end_time) : new Date(Date.now()+4*3600000+13*60000+34000);
    const tick = setInterval(()=>{
      const diff = endTime - Date.now();
      if(diff<=0){clearInterval(tick);setTime({d:'00',h:'00',m:'00',s:'00'});return;}
      setTime({d:String(Math.floor(diff/86400000)).padStart(2,'0'),h:String(Math.floor((diff%86400000)/3600000)).padStart(2,'0'),m:String(Math.floor((diff%3600000)/60000)).padStart(2,'0'),s:String(Math.floor((diff%60000)/1000)).padStart(2,'0')});
    },1000);
    return ()=>clearInterval(tick);
  },[dealData]);

  const deals = dealData?.items?.length ? dealData.items.map(item=>({
    name:item.name, discount:`-${item.discount_percent}%`,
    image:item.image?.startsWith('/uploads')?`http://localhost:5000${item.image}`:watchImg,
    id:item.product_id
  })) : staticDeals;

  return (
    <section className="bg-white border border-shade-border rounded-lg mt-4 flex overflow-hidden">
      <div className="w-52 p-5 border-r border-shade-border flex flex-col justify-center flex-shrink-0">
        <h3 className="text-lg font-bold text-dark mb-1">{dealData?.title||t('dealsOffers')}</h3>
        <p className="text-secondary text-sm mb-4">{dealData?.subtitle||'Hygiene equipments'}</p>
        <div className="flex gap-1.5">
          {[time.d,time.h,time.m,time.s].map((t,i)=>(
            <div key={i} className="w-11 h-11 bg-[#606060] rounded flex flex-col items-center justify-center text-white">
              <span className="text-xs font-bold leading-none">{t}</span>
              <span className="text-[9px] opacity-70 mt-0.5">{['Days','Hour','Min','Sec'][i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 grid grid-cols-3 md:grid-cols-5">
        {deals.slice(0,5).map((d,i)=>(
          <div key={i} onClick={()=>d.id?navigate(`/products/${d.id}`):navigate('/products?category=electronics')}
            className="p-4 flex flex-col items-center text-center border-r last:border-r-0 border-shade-border cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-full aspect-square bg-shade rounded-md flex items-center justify-center mb-3 overflow-hidden p-2">
              <img src={d.image} alt={d.name} className="max-w-[85%] max-h-[85%] object-contain group-hover:scale-110 transition-transform duration-300"/>
            </div>
            <p className="text-dark text-xs mb-2">{d.name}</p>
            <span className="bg-[#FFE3E3] text-[#EB001B] px-2 py-0.5 rounded-full text-xs font-bold">{d.discount}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Category Section ──────────────────────────────────────────────────────────
const CategorySection = ({title,bannerImg:bImg,items,bannerBg,slug})=>{
  const navigate = useNavigate();
  const { t } = useSettings();
  return (
    <section className="bg-white border border-shade-border rounded-lg mt-4 flex overflow-hidden">
      <div className="w-52 p-5 flex flex-col justify-start relative overflow-hidden bg-cover bg-no-repeat flex-shrink-0"
        style={{backgroundColor:bannerBg||'#F7F7F7',backgroundImage:`url("${bImg}")`}}>
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-dark w-36 leading-tight mb-4">{title}</h3>
          <button onClick={()=>navigate(`/products?category=${slug}`)} className="bg-white text-dark px-4 py-1.5 rounded-md font-medium text-xs hover:bg-shade transition-colors shadow-sm">{t('sourceNow')}</button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4">
        {items.map((item,i)=>(
          <div key={i} onClick={()=>navigate(`/products?category=${slug}`)}
            className="p-4 border-r border-b last:border-r-0 border-shade-border flex justify-between cursor-pointer hover:bg-white hover:shadow-md transition-all duration-300 group h-[120px] relative hover:z-10">
            <div className="flex flex-col">
              <span className="text-dark text-xs font-medium group-hover:text-primary transition-colors mb-1">{item.name}</span>
              <span className="text-secondary text-[11px]">From<br/>USD {item.price}</span>
            </div>
            <div className="w-[70px] h-[70px] self-end">
              <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"/>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Inquiry Form ──────────────────────────────────────────────────────────────
const InquiryForm = () => {
  const { t } = useSettings();
  const [form, setForm] = useState({item_name:'',details:'',quantity:1,unit:'Pcs'});
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await API.post('/inquiries',form); toast.success('Inquiry submitted! We will contact you soon.'); setForm({item_name:'',details:'',quantity:1,unit:'Pcs'}); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setLoading(false); }
  };
  return (
    <section className="relative mt-4 rounded-lg overflow-hidden flex items-center bg-cover bg-no-repeat bg-center" style={{minHeight:'380px',backgroundImage:`url("${bgInquiry}")`}}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#2C7CF1]/80 to-[#127FFF]/60 z-0"/>
      <div className="container relative z-10 flex flex-col lg:flex-row justify-between items-center text-white py-10 px-4 gap-8">
        <div className="max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">An easy way to send requests to all suppliers</h2>
          <p className="text-white/80 text-sm hidden md:block">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-[420px] text-dark">
          <h3 className="text-base font-bold mb-4">{t('sendQuote')}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="What item you need?" required className="w-full px-3 py-2 border border-shade-border rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
              value={form.item_name} onChange={e=>setForm({...form,item_name:e.target.value})}/>
            <textarea placeholder="Type more details" rows={3} className="w-full px-3 py-2 border border-shade-border rounded-md text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
              value={form.details} onChange={e=>setForm({...form,details:e.target.value})}/>
            <div className="flex gap-3">
              <input type="number" min="1" placeholder="Quantity" className="flex-1 px-3 py-2 border border-shade-border rounded-md text-sm outline-none"
                value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/>
              <select className="px-3 py-2 border border-shade-border rounded-md bg-white text-sm outline-none"
                value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>
                <option>Pcs</option><option>Kgs</option><option>Sets</option><option>Boxes</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
              {loading?'Sending...':t('sendInquiry')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

// ── Recommended Items ─────────────────────────────────────────────────────────
const staticRec=[
  {price:'10.30',desc:'T-shirts with multiple colors, for men',image:softChair},
  {price:'10.30',desc:'Jeans shorts for men blue color',image:sofaChair},
  {price:'12.50',desc:'Brown winter coat medium size',image:kitchenDish},
  {price:'34.00',desc:'Jeans bag for travel for men',image:laptopImg},
  {price:'99.00',desc:'Leather wallet',image:smartWatchInt},
  {price:'9.99',desc:'Canon camera 20x zoom, silver color',image:goproImg},
  {price:'8.99',desc:'Headset for gaming with mic',image:headsetTech},
  {price:'10.30',desc:'Smart watch silver color',image:watchImg},
  {price:'10.30',desc:'Blue wallet for men',image:blenders},
  {price:'80.00',desc:'Leather bag for travel',image:kitchenMixer},
];
const RecommendedItems = ({products}) => {
  const { t, formatPrice } = useSettings();
  const navigate = useNavigate();
  const items = products.length ? products.slice(0,10).map(p=>({
    price:parseFloat(p.price).toFixed(2), desc:p.name,
    image:p.image?.startsWith('/uploads')?`http://localhost:5000${p.image}`:staticRec[0].image, id:p.id
  })) : staticRec;
  return (
    <section className="mt-6">
      <h3 className="text-xl font-bold mb-4">{t('recommendedItems')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item,i)=>(
          <div key={i} onClick={()=>item.id?navigate(`/products/${item.id}`):null}
            className="bg-white border border-shade-border rounded-lg p-4 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="flex-1 flex items-center justify-center p-3 mb-2">
              <img src={item.image} alt={item.desc} className="max-h-[120px] w-auto object-contain group-hover:scale-110 transition-transform duration-300"/>
            </div>
            <p className="font-semibold text-dark text-base mb-0.5">${item.price}</p>
            <p className="text-secondary text-xs line-clamp-2 leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Services (Dynamic from DB) ────────────────────────────────────────────────
const ServicesSection = () => {
  const { t } = useSettings();
  const [services, setServices] = useState(staticServices);
  useEffect(()=>{ API.get('/settings/services').then(({data})=>{if(data.length)setServices(data);}).catch(()=>{}); },[]);
  const imgMap = {0:maskBg1,1:maskBg2,2:bgInquiry,3:techBanner};
  return (
    <section className="mt-6">
      <h3 className="text-xl font-bold text-dark mb-4">{t('ourServices')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.slice(0,4).map((s,i)=>(
          <div key={s.id||i} className="bg-white border border-shade-border rounded-lg overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            <div className="h-32 overflow-hidden relative">
              <img src={s.image&&s.image.startsWith('/uploads')?`http://localhost:5000${s.image}`:(imgMap[i]||maskBg1)} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"/>
            </div>
            <div className="p-4 relative">
              <div className="absolute -top-7 right-4 w-12 h-12 rounded-full border-2 border-white bg-[#D1E9FF] flex items-center justify-center text-dark group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                {iconMap[s.icon]||<Package className="w-5 h-5"/>}
              </div>
              <p className="font-medium text-dark text-sm leading-snug w-4/5 pb-1">{s.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Suppliers by Region (Dynamic) ─────────────────────────────────────────────
const RegionSuppliers = () => {
  const { t } = useSettings();
  const [regions, setRegions] = useState(staticRegions);
  useEffect(()=>{ API.get('/regions').then(({data})=>{if(data.length)setRegions(data);}).catch(()=>{}); },[]);
  return (
    <section className="mt-6 mb-6">
      <h3 className="text-xl font-bold mb-4">{t('suppliersByRegion')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3">
        {regions.map((r,i)=>(
          <div key={r.id||i} className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="w-7 h-5 overflow-hidden rounded-sm shadow-sm flex-shrink-0">
              <img src={flagMap[r.country_code]||flagUS} alt={r.country_name} className="w-full h-full object-cover"
                onError={e=>{e.target.src=`https://flagcdn.com/w40/${(r.country_code||'us').toLowerCase()}.png`;}}/>
            </div>
            <div>
              <span className="text-dark text-xs font-medium group-hover:text-primary transition-colors block">{r.country_name}</span>
              <span className="text-secondary text-[11px]">{r.supplier_count?`${r.supplier_count.toLocaleString()} suppliers`:r.domain}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Newsletter ────────────────────────────────────────────────────────────────
const NewsletterSection = () => {
  const { t } = useSettings();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubscribe = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await API.post('/newsletter/subscribe',{email}); toast.success('Successfully subscribed! Check your email.'); setEmail(''); }
    catch(err){ toast.error(err.response?.data?.message||'Failed to subscribe'); }
    finally{ setLoading(false); }
  };
  return (
    <section className="bg-shade border-t border-shade-border py-10 flex flex-col items-center text-center">
      <h3 className="text-lg font-bold text-dark mb-1">{t('subscribeNewsletter')}</h3>
      <p className="text-secondary text-sm mb-6">Get daily news on upcoming offers from many suppliers all over the world</p>
      <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-md px-4">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-4 h-4"/>
          <input type="email" required placeholder="Email" className="w-full pl-9 pr-4 py-2 border border-shade-border rounded-md outline-none focus:ring-1 focus:ring-primary text-sm"
            value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
          {loading?'...':t('subscribe')}
        </button>
      </form>
    </section>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => {
  const { language, languages, changeLanguage, t } = useSettings();
  const [showLangPicker, setShowLangPicker] = useState(false);
  return (
    <footer className="bg-white border-t border-shade-border pt-10">
      <div className="container pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-3 col-span-2 sm:col-span-3">
            <img src={logo} alt="Brand" className="h-[40px] mb-4"/>
            <p className="text-dark-light text-sm max-w-xs mb-5 leading-relaxed">Best information about the company goes here but now lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
            <div className="flex gap-2">
              {[Facebook,Twitter,Linkedin,Instagram,Youtube].map((Icon,i)=>(
                <a key={i} href="#" className="w-7 h-7 rounded-full bg-[#BDC4CD] flex items-center justify-center text-white hover:bg-primary transition-all">
                  <Icon className="w-3.5 h-3.5 fill-current"/>
                </a>
              ))}
            </div>
          </div>
          {[
            {title:'About',links:['About Us','Find store','Categories','Blogs']},
            {title:'Partnership',links:['About Us','Find store','Categories','Blogs']},
            {title:'Information',links:['Help Center','Money Refund','Shipping','Contact us']},
            {title:'For users',links:['Login','Register','Settings','My Orders']},
          ].map(col=>(
            <div key={col.title} className="lg:col-span-2">
              <h4 className="font-bold text-dark mb-3 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l=><li key={l}><a href="#" className="text-secondary text-sm hover:text-primary transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-dark mb-3 text-sm">Get app</h4>
            <div className="flex flex-col gap-2">
              {[{icon:Apple,top:'Download on the',bot:'App Store'},{icon:Play,top:'GET IT ON',bot:'Google Play'}].map(({icon:Icon,top,bot})=>(
                <a key={bot} href="#" className="bg-[#1C1C1C] text-white flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-90 w-[130px]">
                  <Icon size={16} fill="white"/>
                  <div><span className="text-[8px] uppercase block leading-none">{top}</span><span className="text-[11px] font-bold">{bot}</span></div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#EFF2F4] border-t border-shade-border py-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#606060] text-sm">© 2024 Ecommerce.</p>
          {/* Dynamic Language Picker in Footer */}
          <div className="relative">
            <button onClick={()=>setShowLangPicker(!showLangPicker)} className="flex items-center gap-2 cursor-pointer hover:text-primary text-sm transition-colors">
              <img src={`https://flagcdn.com/w40/${(language.flag_code||'us').toLowerCase()}.png`} alt="" className="w-5 h-3 object-cover rounded-sm"
                onError={e=>{e.target.style.display='none';}}/>
              <span>{language.name}</span>
              <ChevronUp className="w-4 h-4 text-secondary"/>
            </button>
            {showLangPicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-shade-border rounded-xl shadow-lg py-1 w-44 z-50">
                {(languages.length?languages:[{code:'en',name:'English',flag_code:'US'},{code:'ur',name:'Urdu',flag_code:'PK'},{code:'ar',name:'Arabic',flag_code:'SA'},{code:'fr',name:'French',flag_code:'FR'}]).map(lang=>(
                  <button key={lang.code} onClick={()=>{changeLanguage(lang);setShowLangPicker(false);}}
                    className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm hover:bg-shade hover:text-primary transition-colors ${language.code===lang.code?'text-primary font-medium bg-primary-light':''}`}>
                    <img src={`https://flagcdn.com/w40/${(lang.flag_code||'us').toLowerCase()}.png`} alt="" className="w-5 h-3 object-cover rounded-sm" onError={e=>{e.target.style.display='none';}}/>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ── Main Home ─────────────────────────────────────────────────────────────────
const Home = () => {
  const [featured, setFeatured] = useState([]);
  const homeItems = [
    {name:'Soft chairs',price:'19',image:softChair},{name:'Sofa & chair',price:'19',image:sofaChair},
    {name:'Kitchen dishes',price:'19',image:kitchenDish},{name:'Smart watches',price:'19',image:smartWatchInt},
    {name:'Kitchen mixer',price:'100',image:kitchenMixer},{name:'Blenders',price:'39',image:blenders},
    {name:'Home appliance',price:'19',image:homeAppliance},{name:'Coffee maker',price:'10',image:coffeeMaker},
  ];
  const techItems = [
    {name:'Smart watches',price:'19',image:watchImg},{name:'Cameras',price:'89',image:cameraTech},
    {name:'Headphones',price:'10',image:headphonesImg},{name:'Smartphones',price:'19',image:smartWatchTech},
    {name:'Gaming set',price:'35',image:headsetTech},{name:'Laptop & PC',price:'340',image:laptopPC},
    {name:'Smartphones',price:'19',image:laptopImg},{name:'Electric kettle',price:'240',image:canonImg},
  ];
  useEffect(()=>{ API.get('/products/featured').then(({data})=>setFeatured(data)).catch(()=>{}); },[]);
  return (
    <div className="bg-shade min-h-screen">
      <div className="container pb-4">
        <Hero/>
        <DealsSection/>
        <CategorySection title="Home and outdoor" bannerImg={homeBanner} items={homeItems} bannerBg="#FFFBE6" slug="home-outdoor"/>
        <CategorySection title="Consumer electronics" bannerImg={techBanner} items={techItems} bannerBg="#E3F0FF" slug="electronics"/>
        <InquiryForm/>
        <RecommendedItems products={featured}/>
        <ServicesSection/>
        <RegionSuppliers/>
      </div>
      <NewsletterSection/>
      <Footer/>
    </div>
  );
};

export default Home;

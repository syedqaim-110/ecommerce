import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Globe, DollarSign, HelpCircle, Settings } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const iconOptions = ['Search','Package','Plane','ShieldCheck','Truck','Star','Heart','Gift','Award','Zap'];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [helpArticles, setHelpArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: '', item: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, l, c, h] = await Promise.all([
        API.get('/settings/services/all'), API.get('/settings/languages/all'),
        API.get('/settings/currencies/all'), API.get('/settings/help/all')
      ]);
      setServices(s.data); setLanguages(l.data); setCurrencies(c.data); setHelpArticles(h.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openModal = (type, item=null) => {
    setModal({ open:true, type, item });
    if (type==='service') setForm(item||{title:'',icon:'Package',sort_order:0,is_active:1});
    else if (type==='language') setForm(item||{code:'',name:'',native_name:'',flag_code:'',sort_order:0,is_active:1});
    else if (type==='currency') setForm(item||{code:'',name:'',symbol:'',exchange_rate:1,sort_order:0,is_active:1});
    else if (type==='help') setForm(item||{title:'',content:'',category:'faq',sort_order:0,is_active:1});
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { type, item } = modal;
      const endpoint = {service:'/settings/services',language:'/settings/languages',currency:'/settings/currencies',help:'/settings/help'}[type];
      if (item?.id) await API.put(`${endpoint}/${item.id}`, form);
      else await API.post(endpoint, form);
      toast.success(`${type} ${item?.id?'updated':'created'}!`);
      setModal({open:false,type:'',item:null});
      fetchAll();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setSaving(false); }
  };

  const handleDelete = async (type, id) => {
    if(!confirm('Delete?')) return;
    try {
      const endpoint = {service:'/settings/services',language:'/settings/languages',currency:'/settings/currencies',help:'/settings/help'}[type];
      await API.delete(`${endpoint}/${id}`);
      toast.success('Deleted'); fetchAll();
    } catch { toast.error('Failed'); }
  };

  const tabs = [
    {key:'services',label:'Extra Services',icon:Settings},
    {key:'languages',label:'Languages',icon:Globe},
    {key:'currencies',label:'Currencies',icon:DollarSign},
    {key:'help',label:'Help Articles',icon:HelpCircle},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Site Settings</h2>
        <button onClick={()=>openModal(activeTab==='help'?'help':activeTab==='languages'?'language':activeTab==='currencies'?'currency':'service')}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4"/> Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {tabs.map(({key,label,icon:Icon})=>(
          <button key={key} onClick={()=>setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab===key?'bg-blue-500 text-white':'text-gray-600 hover:bg-gray-50'}`}>
            <Icon className="w-4 h-4"/> {label}
          </button>
        ))}
      </div>

      {loading ? <div className="bg-white rounded-xl border border-gray-200 h-40 animate-pulse"/> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Services */}
          {activeTab==='services' && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr>{['Icon','Title','Sort','Active','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {services.map(s=>(
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><span className="text-lg">{s.icon}</span></td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.title}</td>
                    <td className="px-4 py-3 text-gray-500">{s.sort_order}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${s.is_active?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{s.is_active?'Yes':'No'}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <button onClick={()=>openModal('service',s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4"/></button>
                      <button onClick={()=>handleDelete('service',s.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Languages */}
          {activeTab==='languages' && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr>{['Flag','Code','Name','Native Name','Sort','Active','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {languages.map(l=>(
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><img src={`https://flagcdn.com/w40/${(l.flag_code||'us').toLowerCase()}.png`} alt="" className="w-7 h-4.5 object-cover rounded shadow-sm" onError={e=>{e.target.style.display='none'}}/></td>
                    <td className="px-4 py-3"><span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{l.code}</span></td>
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-gray-500">{l.native_name}</td>
                    <td className="px-4 py-3 text-gray-500">{l.sort_order}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${l.is_active?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{l.is_active?'Yes':'No'}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <button onClick={()=>openModal('language',l)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4"/></button>
                      <button onClick={()=>handleDelete('language',l.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Currencies */}
          {activeTab==='currencies' && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr>{['Code','Symbol','Name','Rate (vs USD)','Sort','Active','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {currencies.map(c=>(
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><span className="font-mono font-bold">{c.code}</span></td>
                    <td className="px-4 py-3 text-lg font-bold text-primary">{c.symbol}</td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono">{parseFloat(c.exchange_rate).toFixed(4)}</td>
                    <td className="px-4 py-3 text-gray-500">{c.sort_order}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.is_active?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{c.is_active?'Yes':'No'}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <button onClick={()=>openModal('currency',c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4"/></button>
                      <button onClick={()=>handleDelete('currency',c.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Help Articles */}
          {activeTab==='help' && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr>{['Title','Category','Sort','Active','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {helpArticles.map(a=>(
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">{a.title}</td>
                    <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">{a.category}</span></td>
                    <td className="px-4 py-3 text-gray-500">{a.sort_order}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${a.is_active?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{a.is_active?'Yes':'No'}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <button onClick={()=>openModal('help',a)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4"/></button>
                      <button onClick={()=>handleDelete('help',a.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-gray-800 capitalize">{modal.item?.id?'Edit':'Add'} {modal.type}</h3>
              <button onClick={()=>setModal({open:false,type:'',item:null})}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">

              {modal.type==='service' && <>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label><input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})}/></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Icon Name</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.icon||'Package'} onChange={e=>setForm({...form,icon:e.target.value})}>
                    {iconOptions.map(i=><option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Sort Order</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:e.target.value})}/></div>
                  <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active==1} onChange={e=>setForm({...form,is_active:e.target.checked?1:0})}/> Active</label></div>
                </div>
              </>}

              {modal.type==='language' && <>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Code * (e.g. en)</label><input required maxLength={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.code||''} onChange={e=>setForm({...form,code:e.target.value.toLowerCase()})}/></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Flag Code (e.g. US)</label><input maxLength={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.flag_code||''} onChange={e=>setForm({...form,flag_code:e.target.value.toUpperCase()})}/></div>
                </div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Name * (e.g. English)</label><input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Native Name (e.g. اردو)</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.native_name||''} onChange={e=>setForm({...form,native_name:e.target.value})}/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Sort</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:e.target.value})}/></div>
                  <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active==1} onChange={e=>setForm({...form,is_active:e.target.checked?1:0})}/> Active</label></div>
                </div>
              </>}

              {modal.type==='currency' && <>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Code * (e.g. USD)</label><input required maxLength={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.code||''} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})}/></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Symbol * (e.g. $)</label><input required maxLength={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.symbol||''} onChange={e=>setForm({...form,symbol:e.target.value})}/></div>
                </div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Name * (e.g. US Dollar)</label><input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Exchange Rate vs USD</label><input type="number" step="0.0001" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.exchange_rate||1} onChange={e=>setForm({...form,exchange_rate:e.target.value})}/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Sort</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:e.target.value})}/></div>
                  <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active==1} onChange={e=>setForm({...form,is_active:e.target.checked?1:0})}/> Active</label></div>
                </div>
              </>}

              {modal.type==='help' && <>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label><input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})}/></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Content</label><textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={form.content||''} onChange={e=>setForm({...form,content:e.target.value})}/></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.category||'faq'} onChange={e=>setForm({...form,category:e.target.value})}>
                    {['faq','shipping','returns','payment','account','other'].map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Sort</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:e.target.value})}/></div>
                  <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active==1} onChange={e=>setForm({...form,is_active:e.target.checked?1:0})}/> Active</label></div>
                </div>
              </>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={()=>setModal({open:false,type:'',item:null})} className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{saving?'Saving...':modal.item?.id?'Update':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;

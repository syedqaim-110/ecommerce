import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Clock } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title:'Deals and offers', subtitle:'Hygiene equipments', end_time:'', is_active:1 });
  const [dealItems, setDealItems] = useState([]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([API.get('/deals'), API.get('/products?limit=100')]);
      setDeals(d.data); setProducts(p.data.products);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchDeals(); }, []);

  const openModal = (deal=null) => {
    setEditItem(deal);
    if (deal) {
      setForm({ title:deal.title, subtitle:deal.subtitle||'', end_time:deal.end_time?.slice(0,16)||'', is_active:deal.is_active });
      setDealItems([]);
    } else {
      const nextWeek = new Date(Date.now() + 7*24*3600000);
      setForm({ title:'Deals and offers', subtitle:'Hygiene equipments', end_time:nextWeek.toISOString().slice(0,16), is_active:1 });
      setDealItems([{product_id:'',discount_percent:25}]);
    }
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const validItems = dealItems.filter(i=>i.product_id);
      const payload = { ...form, items: validItems };
      if (editItem) await API.put(`/deals/${editItem.id}`, payload);
      else await API.post('/deals', payload);
      toast.success(`Deal ${editItem?'updated':'created'}!`);
      setModal(false); fetchDeals();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setSaving(false); }
  };

  const handleDelete = async (id) => {
    if(!confirm('Delete this deal?')) return;
    try { await API.delete(`/deals/${id}`); toast.success('Deleted'); fetchDeals(); }
    catch { toast.error('Failed'); }
  };

  const addItem = () => setDealItems([...dealItems, {product_id:'',discount_percent:25}]);
  const removeItem = (i) => setDealItems(dealItems.filter((_,idx)=>idx!==i));
  const updateItem = (i, key, val) => setDealItems(dealItems.map((item,idx)=>idx===i?{...item,[key]:val}:item));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Deals & Offers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage homepage countdown deals section</p>
        </div>
        <button onClick={()=>openModal()} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4"/> Create Deal
        </button>
      </div>

      {loading ? <div className="bg-white rounded-xl border border-gray-200 h-40 animate-pulse"/> : (
        <div className="grid grid-cols-1 gap-4">
          {deals.length===0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
              <p className="text-gray-500">No deals created yet</p>
              <button onClick={()=>openModal()} className="mt-3 text-blue-500 text-sm hover:underline">Create first deal</button>
            </div>
          ) : deals.map(deal=>(
            <div key={deal.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800">{deal.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${deal.is_active&&new Date(deal.end_time)>new Date()?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                      {deal.is_active&&new Date(deal.end_time)>new Date()?'Active':'Expired'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{deal.subtitle}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5"/>
                    <span>Ends: {new Date(deal.end_time).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={()=>openModal(deal)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4"/></button>
                  <button onClick={()=>handleDelete(deal.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-gray-800">{editItem?'Edit Deal':'Create Deal'}</h3>
              <button onClick={()=>setModal(false)}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Title *</label><input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})}/></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">End Date & Time *</label><input type="datetime-local" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})}/></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active==1} onChange={e=>setForm({...form,is_active:e.target.checked?1:0})}/> Active (show on homepage)</label>

              {/* Deal Items */}
              {!editItem && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">Deal Products</label>
                    <button type="button" onClick={addItem} className="text-blue-500 text-xs hover:underline flex items-center gap-1"><Plus className="w-3 h-3"/> Add Product</button>
                  </div>
                  <div className="space-y-2">
                    {dealItems.map((item,i)=>(
                      <div key={i} className="flex gap-2 items-center">
                        <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.product_id} onChange={e=>updateItem(i,'product_id',e.target.value)}>
                          <option value="">Select Product...</option>
                          {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <input type="number" min="1" max="99" className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center" value={item.discount_percent} onChange={e=>updateItem(i,'discount_percent',e.target.value)}/>
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                        <button type="button" onClick={()=>removeItem(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded flex-shrink-0"><X className="w-3.5 h-3.5"/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={()=>setModal(false)} className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{saving?'Saving...':editItem?'Update':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeals;

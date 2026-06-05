import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const SupplierProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [form, setForm] = useState({ name:'', description:'', price:'', category_id:'', stock:'', shipping_info:'Free Shipping', is_active:1, total_sold:0, discount_percent:0 });
  const [sizes, setSizes] = useState([]);
  const [tiers, setTiers] = useState([{ min_qty:1, max_qty:99, price:'' }, { min_qty:100, max_qty:499, price:'' }, { min_qty:500, max_qty:null, price:'' }]);

  const fetch = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([API.get(`/suppliers/my-products?search=${search}`), API.get('/admin/categories')]);
      setProducts(p.data.products || []); setCategories(c.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search]);

  const openModal = (item = null) => {
    setEditItem(item);
    setImgFile(null);
    if (item) {
      setForm({ name:item.name, description:item.description||'', price:item.old_price||item.price, category_id:item.category_id||'', stock:item.stock, shipping_info:item.shipping_info||'Free Shipping', is_active:item.is_active, total_sold:item.total_orders||0, discount_percent:0 });
      setSizes(item.sizes || []);
      setTiers(item.price_tiers?.length ? item.price_tiers : [{ min_qty:1, max_qty:99, price:'' }]);
    } else {
      setForm({ name:'', description:'', price:'', category_id:'', stock:'', shipping_info:'Free Shipping', is_active:1, total_sold:0, discount_percent:0 });
      setSizes([]);
      setTiers([{ min_qty:1, max_qty:99, price:'' }, { min_qty:100, max_qty:499, price:'' }, { min_qty:500, max_qty:null, price:'' }]);
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('sizes', JSON.stringify(sizes.filter(s => s.label)));
      fd.append('price_tiers', JSON.stringify(tiers.filter(t => t.price)));
      if (imgFile) fd.append('image', imgFile);
      if (editItem) await API.put(`/suppliers/my-products/${editItem.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await API.post('/suppliers/my-products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(editItem ? 'Product updated!' : 'Product created!');
      setShowModal(false); fetch();
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await API.delete(`/suppliers/my-products/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const addSize = () => setSizes([...sizes, { label: '', stock: 0 }]);
  const removeSize = (i) => setSizes(sizes.filter((_, idx) => idx !== i));
  const updateSize = (i, key, val) => setSizes(sizes.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  const finalPrice = form.discount_percent > 0 ? (parseFloat(form.price || 0) * (1 - form.discount_percent / 100)).toFixed(2) : form.price;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Products</h2>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Image', 'Name', 'Price', 'Stock', 'Sold', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr> :
               products.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No products yet. Add your first product!</td></tr> :
               products.map(p => {
                const img = p.image?.startsWith('/uploads') ? `http://localhost:5000${p.image}` : (p.image || null);
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 ${!p.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {img ? <img src={img} alt={p.name} className="w-full h-full object-contain p-1" /> : <span className="text-gray-400 text-xs">No img</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px]"><p className="truncate">{p.name}</p><p className="text-xs text-gray-400">{p.category_name}</p></td>
                    <td className="px-4 py-3"><span className="font-bold text-blue-600">${parseFloat(p.price).toFixed(2)}</span>{p.old_price && <span className="text-gray-400 line-through ml-1 text-xs">${parseFloat(p.old_price).toFixed(2)}</span>}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3 text-gray-600">{p.total_orders || 0}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <button onClick={() => openModal(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                );
               })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-800">{editItem ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-5">
              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Basic Information</h4>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label><input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Description</label><textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Product Image</label><input type="file" accept="image/*" className="w-full text-sm" onChange={e => setImgFile(e.target.files[0])} /></div>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Pricing & Stock</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Base Price (USD) *</label><input type="number" step="0.01" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Discount %</label><input type="number" min="0" max="99" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: e.target.value })} /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Final Price</label><input disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 font-bold text-blue-600" value={finalPrice ? `$${finalPrice}` : '-'} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label><input type="number" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Total Sold (manual)</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.total_sold} onChange={e => setForm({ ...form, total_sold: e.target.value })} /></div>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Shipping Info</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.shipping_info} onChange={e => setForm({ ...form, shipping_info: e.target.value })} /></div>
              </div>

              {/* Price Tiers */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Price Tiers (by quantity)</h4>
                {tiers.map((tier, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="number" placeholder="Min qty" className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" value={tier.min_qty} onChange={e => setTiers(tiers.map((t, idx) => idx === i ? { ...t, min_qty: e.target.value } : t))} />
                    <span className="text-gray-400 text-xs">-</span>
                    <input type="number" placeholder="Max qty" className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" value={tier.max_qty || ''} onChange={e => setTiers(tiers.map((t, idx) => idx === i ? { ...t, max_qty: e.target.value || null } : t))} />
                    <span className="text-gray-400 text-xs">pcs @</span>
                    <input type="number" step="0.01" placeholder="Price $" className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" value={tier.price} onChange={e => setTiers(tiers.map((t, idx) => idx === i ? { ...t, price: e.target.value } : t))} />
                    <button type="button" onClick={() => setTiers(tiers.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:bg-red-50 rounded"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setTiers([...tiers, { min_qty: '', max_qty: null, price: '' }])} className="text-blue-500 text-xs hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add tier</button>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-sm font-semibold text-gray-700">Sizes (optional)</h4>
                  <span className="text-xs text-gray-400">Leave empty if product has no sizes</span>
                </div>
                {sizes.map((size, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Size label (e.g. S, M, XL, 42)" className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" value={size.label} onChange={e => updateSize(i, 'label', e.target.value)} />
                    <input type="number" placeholder="Stock" className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" value={size.stock} onChange={e => updateSize(i, 'stock', e.target.value)} />
                    <button type="button" onClick={() => removeSize(i)} className="p-1 text-red-400 hover:bg-red-50 rounded"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={addSize} className="text-blue-500 text-xs hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add size</button>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.is_active == 1} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />
                <label htmlFor="active" className="text-sm text-gray-600 cursor-pointer">Active (visible to customers)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProducts;

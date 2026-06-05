import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [form, setForm] = useState({ name: '', description: '', price: '', old_price: '', category_id: '', stock: '', shipping_info: 'Free Shipping', is_featured: 0, is_active: 1 });
  const [imgFile, setImgFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/products?search=${search}&page=${page}&limit=15`);
      setProducts(data.products); setPages(data.pages);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search, page]);
  useEffect(() => { API.get('/admin/categories').then(({ data }) => setCategories(data)).catch(() => {}); }, []);

  const openModal = (product = null) => {
    setEditProduct(product);
    setForm(product ? { name: product.name, description: product.description || '', price: product.price, old_price: product.old_price || '', category_id: product.category_id || '', stock: product.stock, shipping_info: product.shipping_info || 'Free Shipping', is_featured: product.is_featured, is_active: product.is_active } : { name: '', description: '', price: '', old_price: '', category_id: '', stock: '', shipping_info: 'Free Shipping', is_featured: 0, is_active: 1 });
    setImgFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imgFile) formData.append('image', imgFile);
      if (editProduct) { await API.put(`/products/${editProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Product updated!'); }
      else { await API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Product created!'); }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await API.delete(`/products/${id}`); toast.success('Product deleted'); fetchProducts(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Products</h2>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Image', 'Name', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr> :
              products.map(p => {
                const img = p.image?.startsWith('/uploads') ? `http://localhost:5000${p.image}` : (p.image || 'https://via.placeholder.com/50');
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><img src={img} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-gray-100 p-1" /></td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category_name || '-'}</td>
                    <td className="px-4 py-3"><span className="font-bold text-blue-600">${parseFloat(p.price).toFixed(2)}</span>{p.old_price && <span className="text-gray-400 line-through ml-1 text-xs">${parseFloat(p.old_price).toFixed(2)}</span>}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3">{p.is_featured == 1 ? <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openModal(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded text-sm font-medium ${page === i + 1 ? 'bg-blue-500 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Price *</label><input type="number" step="0.01" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Old Price</label><input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}><option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label><input type="file" accept="image/*" className="w-full text-sm" onChange={e => setImgFile(e.target.files[0])} /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_featured == 1} onChange={e => setForm({ ...form, is_featured: e.target.checked ? 1 : 0 })} /> Featured</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active == 1} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} /> Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : (editProduct ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

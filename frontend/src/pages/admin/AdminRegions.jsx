import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Globe } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminRegions = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ country_name: '', country_code: '', domain: '', supplier_count: 0, sort_order: 0, is_active: 1 });
  const [saving, setSaving] = useState(false);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/regions/all');
      setRegions(data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchRegions(); }, []);

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { country_name: item.country_name, country_code: item.country_code, domain: item.domain || '', supplier_count: item.supplier_count || 0, sort_order: item.sort_order || 0, is_active: item.is_active } : { country_name: '', country_code: '', domain: '', supplier_count: 0, sort_order: 0, is_active: 1 });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await API.put(`/regions/${editItem.id}`, form);
        toast.success('Region updated!');
      } else {
        await API.post('/regions', form);
        toast.success('Region created!');
      }
      setShowModal(false);
      fetchRegions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this region?')) return;
    try { await API.delete(`/regions/${id}`); toast.success('Deleted'); fetchRegions(); }
    catch { toast.error('Failed to delete'); }
  };

  const flagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Suppliers by Region</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage regions shown on homepage</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Region
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Flag', 'Country', 'Code', 'Domain', 'Suppliers', 'Order', 'Active', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {regions.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">No regions yet</td></tr> :
               regions.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 ${!r.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <img src={flagUrl(r.country_code)} alt={r.country_name} className="w-8 h-5 object-cover rounded shadow-sm"
                      onError={e => { e.target.style.display = 'none'; }} />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.country_name}</td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">{r.country_code}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.domain || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{r.supplier_count?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{r.sort_order}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.is_active ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editItem ? 'Edit Region' : 'Add Region'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Country Name *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. United States" value={form.country_name} onChange={e => setForm({ ...form, country_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Country Code *</label>
                  <input required maxLength={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="e.g. US" value={form.country_code} onChange={e => setForm({ ...form, country_code: e.target.value.toUpperCase() })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Domain</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. shopname.us" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Count</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.supplier_count} onChange={e => setForm({ ...form, supplier_count: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.is_active == 1} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />
                Show on homepage
              </label>
              <div className="flex gap-3 pt-1">
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

export default AdminRegions;

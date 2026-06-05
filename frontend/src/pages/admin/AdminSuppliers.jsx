import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Eye, X, Shield } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/suppliers?search=${search}&limit=50`);
      setSuppliers(data.suppliers); setTotal(data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchSuppliers(); }, [search]);

  const handleVerify = async (id, is_verified) => {
    try {
      await API.put(`/suppliers/${id}/verify`, { is_verified: is_verified ? 1 : 0 });
      toast.success(is_verified ? 'Supplier verified!' : 'Verification removed');
      fetchSuppliers();
      if (selected?.id === id) setSelected(prev => ({ ...prev, is_verified: is_verified ? 1 : 0 }));
    } catch { toast.error('Failed'); }
  };

  const handleToggle = async (id) => {
    try {
      await API.put(`/suppliers/${id}/toggle`);
      toast.success('Status updated');
      fetchSuppliers();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Suppliers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage and verify supplier accounts</p>
        </div>
        <div className="text-sm text-gray-500">Total: {total}</div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search suppliers..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Company', 'Owner', 'Location', 'Products', 'Verified', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr> :
               suppliers.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No suppliers found</td></tr> :
               suppliers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {s.logo ? <img src={`http://localhost:5000${s.logo}`} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{s.company_name?.[0]}</div>}
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{s.company_name}</p>
                        <p className="text-xs text-gray-400">{s.website || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.city && s.country ? `${s.city}, ${s.country}` : s.country || s.city || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-700 font-medium">{s.total_products}</td>
                  <td className="px-4 py-3">
                    {s.is_verified ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle className="w-4 h-4" /> Verified</span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium"><Shield className="w-4 h-4" /> Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelected(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="View"><Eye className="w-4 h-4" /></button>
                      {s.is_verified ? (
                        <button onClick={() => handleVerify(s.id, false)} className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded" title="Remove verification"><XCircle className="w-4 h-4" /></button>
                      ) : (
                        <button onClick={() => handleVerify(s.id, true)} className="p-1.5 text-green-500 hover:bg-green-50 rounded" title="Verify"><CheckCircle className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => handleToggle(s.id)} className={`p-1.5 rounded text-xs font-medium ${s.is_active ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`} title={s.is_active ? 'Deactivate' : 'Activate'}>
                        {s.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Supplier Details</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                {selected.logo ? <img src={`http://localhost:5000${selected.logo}`} alt="" className="w-14 h-14 rounded-xl object-cover" /> : <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">{selected.company_name?.[0]}</div>}
                <div>
                  <h4 className="font-bold text-gray-800">{selected.company_name}</h4>
                  <div className="flex items-center gap-1">{selected.is_verified ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Verified</span> : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['Owner', selected.name], ['Email', selected.email], ['Phone', selected.phone||'-'], ['Country', selected.country||'-'], ['City', selected.city||'-'], ['Products', selected.total_products]].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-0.5">{k}</p><p className="font-medium text-gray-800 text-sm">{v}</p></div>
                ))}
              </div>
              {selected.description && <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Description</p><p className="text-sm text-gray-700">{selected.description}</p></div>}
              <div className="flex gap-3">
                {selected.is_verified ? (
                  <button onClick={() => { handleVerify(selected.id, false); setSelected(null); }} className="flex-1 border border-yellow-300 text-yellow-600 py-2 rounded-lg text-sm font-medium hover:bg-yellow-50">Remove Verification</button>
                ) : (
                  <button onClick={() => { handleVerify(selected.id, true); setSelected(null); }} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4"/> Verify Supplier</button>
                )}
                <button onClick={() => { handleToggle(selected.id); setSelected(null); }} className={`flex-1 py-2 rounded-lg text-sm font-medium ${selected.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {selected.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliers;

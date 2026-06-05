import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Search } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/users?page=${page}&limit=15`);
      setUsers(data.users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())));
      setTotal(data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const toggleUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: u.is_active ? 0 : 1 } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update user'); }
  };

  const pages = Math.ceil(total / 15);
  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Users <span className="text-gray-400 text-base font-normal">({total})</span></h2>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No users found</td></tr> :
              filtered.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 ${!user.is_active ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">{user.name?.[0]?.toUpperCase()}</div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500">{user.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {user.role !== 'admin' && (
                      <button onClick={() => toggleUser(user.id)} className={`p-1.5 rounded transition-colors ${user.is_active ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`} title={user.is_active ? 'Deactivate' : 'Activate'}>
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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
    </div>
  );
};

export default AdminUsers;

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, X } from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [sites, setSites] = useState([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    roleId: 3,
    siteid: ''
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const [res, siteRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/sites')
      ]);
      let data = await res.json();
      const siteData = await siteRes.json();
      setSites(siteData);
      
      // Supervisor only sees their own drivers
      if (currentUser.roleId === 2) {
        data = data.filter(u => u.supervisorPhone === currentUser.phone);
      }
      
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser.roleId, currentUser.phone]);

  const getRoleName = (roleId) => {
    if (roleId === 1) return 'Admin';
    if (roleId === 2) return 'Supervisor';
    return 'Driver';
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', phone: '', password: '', roleId: 3, siteid: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name || '', phone: user.phone, password: '', roleId: user.roleId, siteid: user.siteid || '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    if (!/^\d{10}$/.test(formData.phone)) {
      setFormError('Phone number must be exactly 10 digits.');
      setSaving(false);
      return;
    }

    if (formData.password && formData.password.length <= 6) {
      setFormError('Password must be more than 6 characters.');
      setSaving(false);
      return;
    }

    // If editing and password is left empty, we shouldn't send it or the backend might overwrite with empty string
    // Our basic backend will overwrite. Let's make password required always for simplicity, 
    // or if edit, only send password if provided. 
    const payload = { ...formData, roleId: Number(formData.roleId) };
    if (editingUser && !payload.password) {
      delete payload.password;
    } else if (!editingUser && !payload.password) {
      setFormError('Password is required for new users.');
      setSaving(false);
      return;
    }

    if (payload.roleId === 2 && payload.siteid) {
      const selectedSite = sites.find(s => s.siteid === payload.siteid);
      payload.sitename = selectedSite ? selectedSite.sitename : '';
    } else {
      payload.siteid = '';
      payload.sitename = '';
    }

    // Assign supervisorPhone automatically if current user is supervisor, or if creating a driver
    if (currentUser.roleId === 2 && payload.roleId === 3) {
      payload.supervisorPhone = currentUser.phone;
    }

    try {
      const res = await fetch('/api/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save user');
      }

      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-jcb-yellow" size={48} /></div>;

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User List</h2>
        <button 
          onClick={openAddModal}
          className="bg-jcb-yellow text-jcb-black px-4 py-2 rounded font-bold shadow-md flex items-center space-x-1 active:scale-95"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      <div className="space-y-4">
        {users.map((u, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow flex flex-col space-y-2 relative">
            <button 
              onClick={() => openEditModal(u)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1"
            >
              <Edit2 size={18} />
            </button>
            <div className="pr-8">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold text-lg">{u.name || 'No Name'}</span>
                <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded font-semibold">{getRoleName(u.roleId)}</span>
              </div>
              <p className="text-sm text-gray-600">Phone: {u.phone}</p>
              {u.roleId === 2 && u.sitename && (
                <p className="text-sm text-blue-600 font-bold mt-1">📍 Site: {u.sitename}</p>
              )}
              {u.supervisorPhone && <p className="text-sm text-gray-600">Supervisor: {u.supervisorPhone}</p>}
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-center text-gray-500 mt-10">No users found.</p>}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              {formError && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm font-semibold">{formError}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jcb-yellow"
                    placeholder="Enter name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (10 digits)</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jcb-yellow"
                    placeholder="10 digit phone number"
                    pattern="\d{10}"
                    maxLength="10"
                    disabled={!!editingUser} // Disable changing phone on edit to avoid breaking relations/login easily
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingUser && '(Leave blank to keep unchanged)'}
                  </label>
                  <input 
                    type="text" // Show as text for admin convenience, or password
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jcb-yellow"
                    placeholder="More than 6 characters"
                    minLength={editingUser && !formData.password ? undefined : "7"}
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.roleId}
                    onChange={e => setFormData({...formData, roleId: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jcb-yellow bg-white"
                  >
                    {/* Admin can see Supervisor (2) and Driver (3) */}
                    {currentUser.roleId === 1 && (
                      <option value={2}>Supervisor</option>
                    )}
                    <option value={3}>Driver</option>
                  </select>
                </div>

                {formData.roleId === 2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Site</label>
                    <select
                      value={formData.siteid}
                      onChange={e => setFormData({...formData, siteid: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jcb-yellow bg-white"
                      required
                    >
                      <option value="" disabled>Select a site</option>
                      {sites.map(s => (
                        <option key={s.siteid} value={s.siteid}>{s.sitename} ({s.siteid})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-4 border-t mt-6 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 mr-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-jcb-yellow text-jcb-black px-6 py-2 rounded font-bold shadow flex items-center"
                  >
                    {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                    {editingUser ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;

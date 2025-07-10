import React, { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const emptyUser = { id: 0, name: '', email: '', role: 'user', created_at: '' };

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formUser, setFormUser] = useState<User>(emptyUser);
  const [isEdit, setIsEdit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const handleEdit = (user: User) => {
    setFormUser(user);
    setIsEdit(true);
    setShowForm(true);
    setFormError(null);
  };

  const handleAdd = () => {
    setFormUser({ ...emptyUser });
    setIsEdit(false);
    setShowForm(true);
    setFormError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormUser({ ...formUser, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (isEdit) {
        const res = await fetch(`/api/users/${formUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formUser.name, email: formUser.email, role: formUser.role })
        });
        if (!res.ok) throw new Error("Failed to update user");
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formUser.name, email: formUser.email, password: 'changeme', role: formUser.role })
        });
        if (!res.ok) {
          // Try to parse error JSON, but handle empty body
          let errorMsg = 'Failed to create user';
          try {
            const text = await res.text();
            if (text) {
              const data = JSON.parse(text);
              errorMsg = data.message || JSON.stringify(data);
            } else {
              errorMsg = `Error: ${res.status} ${res.statusText}`;
            }
          } catch {
            errorMsg = `Error: ${res.status} ${res.statusText}`;
          }
          throw new Error(errorMsg);
        }
      }
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Form error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Add User</button>
      {loading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b">{new Date(user.created_at).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  <button className="mr-2 px-2 py-1 bg-yellow-400 text-white rounded" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <form className="bg-white p-6 rounded shadow-md min-w-[300px]" onSubmit={handleFormSubmit}>
            <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit User' : 'Add User'}</h2>
            <div className="mb-2">
              <label className="block mb-1">Name</label>
              <input name="name" value={formUser.name} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Email</label>
              <input name="email" type="email" value={formUser.email} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Role</label>
              <select name="role" value={formUser.role} onChange={handleFormChange} className="border px-2 py-1 rounded w-full">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formError && <div className="text-red-500 mb-2">{formError}</div>}
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" className="px-3 py-1 bg-gray-300 rounded" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{isEdit ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 
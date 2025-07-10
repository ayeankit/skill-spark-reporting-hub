import React, { useEffect, useState } from "react";

interface SkillCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

const emptyCategory = { id: 0, name: '', description: '', created_at: '' };

const SkillCategories: React.FC = () => {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState<SkillCategory>(emptyCategory);
  const [isEdit, setIsEdit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("/api/skill-categories", {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        let errorMsg = `Error: ${res.status} ${res.statusText}`;
        try {
          const text = await res.text();
          if (text) {
            const data = JSON.parse(text);
            errorMsg = data.message || JSON.stringify(data);
          }
        } catch {}
        throw new Error(errorMsg);
      }
      // Only parse JSON if there is content
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this skill category?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/skill-categories/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error("Failed to delete skill category");
      fetchCategories();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const handleEdit = (cat: SkillCategory) => {
    setFormCategory(cat);
    setIsEdit(true);
    setShowForm(true);
    setFormError(null);
  };

  const handleAdd = () => {
    setFormCategory({ ...emptyCategory });
    setIsEdit(false);
    setShowForm(true);
    setFormError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormCategory({ ...formCategory, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const token = localStorage.getItem('token');
      if (isEdit) {
        const res = await fetch(`/api/skill-categories/${formCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ name: formCategory.name, description: formCategory.description })
        });
        if (!res.ok) {
          let errorMsg = `Error: ${res.status} ${res.statusText}`;
          try {
            const text = await res.text();
            if (text) {
              const data = JSON.parse(text);
              errorMsg = data.message || JSON.stringify(data);
            }
          } catch {}
          throw new Error(errorMsg);
        }
      } else {
        const res = await fetch('/api/skill-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ name: formCategory.name, description: formCategory.description })
        });
        if (!res.ok) {
          let errorMsg = `Error: ${res.status} ${res.statusText}`;
          try {
            const text = await res.text();
            if (text) {
              const data = JSON.parse(text);
              errorMsg = data.message || JSON.stringify(data);
            }
          } catch {}
          throw new Error(errorMsg);
        }
      }
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || "Form error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Skill Categories</h1>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Add Skill Category</button>
      {loading ? (
        <div>Loading skill categories...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="py-2 px-4 border-b">{cat.id}</td>
                <td className="py-2 px-4 border-b">{cat.name}</td>
                <td className="py-2 px-4 border-b">{cat.description}</td>
                <td className="py-2 px-4 border-b">{new Date(cat.created_at).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  <button className="mr-2 px-2 py-1 bg-yellow-400 text-white rounded" onClick={() => handleEdit(cat)}>Edit</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(cat.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <form className="bg-white p-6 rounded shadow-md min-w-[300px]" onSubmit={handleFormSubmit}>
            <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit Skill Category' : 'Add Skill Category'}</h2>
            <div className="mb-2">
              <label className="block mb-1">Name</label>
              <input name="name" value={formCategory.name} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Description</label>
              <textarea name="description" value={formCategory.description} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" />
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

export default SkillCategories; 
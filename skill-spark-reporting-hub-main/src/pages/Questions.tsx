import React, { useEffect, useState } from "react";

interface SkillCategory {
  id: number;
  name: string;
}

interface Question {
  id: number;
  skill_category_id: number;
  question_text: string;
  options: string[];
  correct_option: number;
  created_at: string;
}

const emptyQuestion: Question = {
  id: 0,
  skill_category_id: 0,
  question_text: '',
  options: ['', ''],
  correct_option: 0,
  created_at: ''
};

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formQuestion, setFormQuestion] = useState<Question>(emptyQuestion);
  const [isEdit, setIsEdit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/skill-categories");
      if (!res.ok) throw new Error("Failed to fetch skill categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {}
  };

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete question");
      fetchQuestions();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const handleEdit = (q: Question) => {
    setFormQuestion({ ...q, options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as any) });
    setIsEdit(true);
    setShowForm(true);
    setFormError(null);
  };

  const handleAdd = () => {
    setFormQuestion({ ...emptyQuestion, options: ['', ''] });
    setIsEdit(false);
    setShowForm(true);
    setFormError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const idx = parseInt(name.replace('option', ''));
      const newOptions = [...formQuestion.options];
      newOptions[idx] = value;
      setFormQuestion({ ...formQuestion, options: newOptions });
    } else if (name === 'correct_option') {
      setFormQuestion({ ...formQuestion, correct_option: parseInt(value) });
    } else if (name === 'skill_category_id') {
      setFormQuestion({ ...formQuestion, skill_category_id: parseInt(value) });
    } else {
      setFormQuestion({ ...formQuestion, [name]: value });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (formQuestion.options.length < 2 || formQuestion.options.some(opt => !opt)) {
        throw new Error('At least two options are required and none can be empty.');
      }
      if (isEdit) {
        const res = await fetch(`/api/questions/${formQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skill_category_id: formQuestion.skill_category_id,
            question_text: formQuestion.question_text,
            options: formQuestion.options,
            correct_option: formQuestion.correct_option
          })
        });
        if (!res.ok) throw new Error("Failed to update question");
      } else {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skill_category_id: formQuestion.skill_category_id,
            question_text: formQuestion.question_text,
            options: formQuestion.options,
            correct_option: formQuestion.correct_option
          })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to create question");
        }
      }
      setShowForm(false);
      fetchQuestions();
    } catch (err: any) {
      setFormError(err.message || "Form error");
    }
  };

  const handleAddOption = () => {
    setFormQuestion({ ...formQuestion, options: [...formQuestion.options, ''] });
  };

  const handleRemoveOption = (idx: number) => {
    if (formQuestion.options.length <= 2) return;
    setFormQuestion({ ...formQuestion, options: formQuestion.options.filter((_, i) => i !== idx) });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Questions</h1>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Add Question</button>
      {loading ? (
        <div>Loading questions...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Skill Category</th>
              <th className="py-2 px-4 border-b">Question</th>
              <th className="py-2 px-4 border-b">Options</th>
              <th className="py-2 px-4 border-b">Correct Option</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td className="py-2 px-4 border-b">{q.id}</td>
                <td className="py-2 px-4 border-b">{categories.find(c => c.id === q.skill_category_id)?.name || q.skill_category_id}</td>
                <td className="py-2 px-4 border-b">{q.question_text}</td>
                <td className="py-2 px-4 border-b">{q.options && (Array.isArray(q.options) ? q.options : JSON.parse(q.options as any)).map((opt, i) => <div key={i}>{i+1}. {opt}</div>)}</td>
                <td className="py-2 px-4 border-b">{q.correct_option + 1}</td>
                <td className="py-2 px-4 border-b">{new Date(q.created_at).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  <button className="mr-2 px-2 py-1 bg-yellow-400 text-white rounded" onClick={() => handleEdit(q)}>Edit</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(q.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <form className="bg-white p-6 rounded shadow-md min-w-[350px]" onSubmit={handleFormSubmit}>
            <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit Question' : 'Add Question'}</h2>
            <div className="mb-2">
              <label className="block mb-1">Skill Category</label>
              <select name="skill_category_id" value={formQuestion.skill_category_id} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required>
                <option value="">Select...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Question</label>
              <textarea name="question_text" value={formQuestion.question_text} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Options</label>
              {formQuestion.options.map((opt, idx) => (
                <div key={idx} className="flex items-center mb-1">
                  <input
                    name={`option${idx}`}
                    value={opt}
                    onChange={handleFormChange}
                    className="border px-2 py-1 rounded w-full mr-2"
                    required
                  />
                  {formQuestion.options.length > 2 && (
                    <button type="button" className="px-2 py-1 bg-red-400 text-white rounded" onClick={() => handleRemoveOption(idx)}>-</button>
                  )}
                </div>
              ))}
              <button type="button" className="mt-1 px-2 py-1 bg-green-500 text-white rounded" onClick={handleAddOption}>Add Option</button>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Correct Option</label>
              <select name="correct_option" value={formQuestion.correct_option} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required>
                {formQuestion.options.map((_, idx) => (
                  <option key={idx} value={idx}>{`Option ${idx + 1}`}</option>
                ))}
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

export default Questions; 
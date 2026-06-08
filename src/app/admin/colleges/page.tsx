'use client';

import { useState, useEffect, useCallback } from 'react';
import { COLLEGE_TYPES, INDIAN_STATES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import type { College, CollegeForm } from '@/types';

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Form state
  const [form, setForm] = useState<CollegeForm>({
    college_name: '',
    state: '',
    college_type: 'Government',
  });

  const fetchColleges = useCallback(async () => {
    const res = await fetch('/api/admin/colleges');
    const data = await res.json();
    if (data.success) setColleges(data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const openAdd = () => {
    setEditingCollege(null);
    setForm({ college_name: '', state: '', college_type: 'Government' });
    setModalOpen(true);
  };

  const openEdit = (college: College) => {
    setEditingCollege(college);
    setForm({
      college_name: college.college_name,
      state: college.state,
      college_type: college.college_type,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingCollege ? 'PUT' : 'POST';
      const body = editingCollege
        ? { id: editingCollege.id, ...form }
        : form;

      const res = await fetch('/api/admin/colleges', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchColleges();
      } else {
        alert(data.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this college? This will also remove all its branches and cutoffs.')) return;
    await fetch(`/api/admin/colleges?id=${id}`, { method: 'DELETE' });
    fetchColleges();
  };

  const filtered = colleges.filter(
    (c) =>
      c.college_name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <Spinner className="py-20" />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colleges</h1>
          <p className="text-sm text-gray-500">{colleges.length} total</p>
        </div>
        <Button onClick={openAdd}>+ Add College</Button>
      </div>

      <Card padding="sm" className="mb-4">
        <Input
          placeholder="Search colleges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((college) => (
                <tr key={college.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {college.college_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{college.state}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{college.college_type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(college)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(college.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                    No colleges found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCollege ? 'Edit College' : 'Add College'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingCollege ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="College Name"
            value={form.college_name}
            onChange={(e) =>
              setForm({ ...form, college_name: e.target.value })
            }
            placeholder="Enter college name"
            required
          />
          <Select
            label="State"
            options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
            placeholder="Select state"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <Select
            label="College Type"
            options={COLLEGE_TYPES.map((t) => ({ value: t, label: t }))}
            value={form.college_type}
            onChange={(e) =>
              setForm({
                ...form,
                college_type: e.target.value as CollegeForm['college_type'],
              })
            }
          />
        </div>
      </Modal>
    </div>
  );
}

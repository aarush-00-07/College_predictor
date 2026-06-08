'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import type { College } from '@/types';

interface BranchWithCollege {
  id: string;
  branch_name: string;
  college_id: string;
  colleges: { college_name: string };
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<BranchWithCollege[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BranchWithCollege | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const [branchName, setBranchName] = useState('');
  const [collegeId, setCollegeId] = useState('');

  const fetchData = useCallback(async () => {
    const [brRes, colRes] = await Promise.all([
      fetch('/api/admin/branches'),
      fetch('/api/admin/colleges'),
    ]);
    const brData = await brRes.json();
    const colData = await colRes.json();
    if (brData.success) setBranches(brData.data);
    if (colData.success) setColleges(colData.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAdd = () => {
    setEditing(null);
    setBranchName('');
    setCollegeId('');
    setModalOpen(true);
  };

  const openEdit = (branch: BranchWithCollege) => {
    setEditing(branch);
    setBranchName(branch.branch_name);
    setCollegeId(branch.college_id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing
        ? { id: editing.id, branch_name: branchName, college_id: collegeId }
        : { branch_name: branchName, college_id: collegeId };

      const res = await fetch('/api/admin/branches', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchData();
      } else {
        alert(data.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch?')) return;
    await fetch(`/api/admin/branches?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filtered = branches.filter(
    (b) =>
      b.branch_name.toLowerCase().includes(search.toLowerCase()) ||
      b.colleges?.college_name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <Spinner className="py-20" />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-sm text-gray-500">{branches.length} total</p>
        </div>
        <Button onClick={openAdd}>+ Add Branch</Button>
      </div>

      <Card padding="sm" className="mb-4">
        <Input
          placeholder="Search branches or colleges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">College</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {branch.branch_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {branch.colleges?.college_name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(branch)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(branch.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-gray-500">
                    No branches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Branch' : 'Add Branch'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="College"
            options={colleges.map((c) => ({
              value: c.id,
              label: c.college_name,
            }))}
            placeholder="Select college"
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
          />
          <Input
            label="Branch Name"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="e.g. Computer Science and Engineering"
            required
          />
        </div>
      </Modal>
    </div>
  );
}

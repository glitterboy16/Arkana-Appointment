import { useEffect, useState } from "react";
import { createUserRepository } from "../../database/repositories";
import toast, { Toaster } from 'react-hot-toast';
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

export default function AdminUsersTable() {
  const { t } = useTranslation();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const userRepository = createUserRepository();

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await userRepository.fetchAdminUsersList();

      if (error) {
        setError(t('admin.users.loadError'));
      } else if (data) {
        setUsers(data);
      }
      setLoading(false);
    };

    void loadUsers();
  }, []);

  const handleEditClick = (user: any) => {
    setEditingId(user.id);
    setNewRole(user.role);
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleSaveRole = async (userId: string) => {
    const { error } = await userRepository.updateUserRole(userId, newRole);

    if (error) {
      toast.error(t('admin.users.roleUpdateError'));
    } else {
      toast.success(t('admin.users.roleUpdated'));
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setEditingId(null);
    }
  };

  const handleDeleteUser = async (user: any) => {
    const result = await Swal.fire({
      title: t('admin.users.confirmDeleteTitle'),
      text: t('admin.users.confirmDeleteText' as any, { user: user.username || user.email }), showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: t('admin.users.confirmDeleteAction'),
      cancelButtonText: t('common.cancel'),
      customClass: { popup: 'rounded-2xl' },
    });

    if (result.isConfirmed) {
      const { error } = await userRepository.deleteUser(user.id);

      if (error) {
        toast.error(t('admin.users.deleteUserError'));
        console.error(error);
      } else {
        toast.success(t('admin.users.deleteUserSuccess'));
        setUsers(users.filter((u) => u.id !== user.id));
      }
    }
  };

  if (loading) return <p className="app-muted">{t('admin.users.loading')}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="app-surface-strong overflow-x-auto rounded-3xl border p-4 shadow-md">
      <Toaster position="top-center" />

      <table className="min-w-full border-collapse rounded-2xl border border-[var(--app-border)] overflow-hidden">
        <thead className="app-surface">
          <tr>
            <th className="border border-[var(--app-border)] p-3 text-left">{t('admin.users.columns.user')}</th>
            <th className="border border-[var(--app-border)] p-3 text-left">{t('admin.users.columns.email')}</th>
            <th className="border border-[var(--app-border)] p-3 text-left">{t('admin.users.columns.role')}</th>
            <th className="border border-[var(--app-border)] p-3 text-left">{t('admin.users.columns.createdAt')}</th>
            <th className="border border-[var(--app-border)] p-3 text-left">{t('admin.users.columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="transition-colors hover:bg-[rgba(47,107,255,0.08)]">
              <td className="border border-[var(--app-border)] p-3">
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={t('admin.users.avatarAlt')} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="app-chip flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span>{user.username || 'Sin nombre'}</span>
                </div>
              </td>
              <td className="app-muted border border-[var(--app-border)] p-3 text-sm">{user.email}</td>
              <td className="border border-[var(--app-border)] p-3">
                {editingId === user.id ? (
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="app-input rounded-lg border px-2 py-1 text-sm"
                  >
                    <option value="user">{t('admin.roles.user')}</option>
                    <option value="admin">{t('admin.roles.admin')}</option>
                  </select>
                ) : (
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'app-chip border'}`}>
                    {user.role || 'user'}
                  </span>
                )}
              </td>
              <td className="app-muted border border-[var(--app-border)] p-3 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="border border-[var(--app-border)] p-3">
                {editingId === user.id ? (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleSaveRole(user.id)} className="rounded-lg bg-green-500 px-3 py-1 text-sm text-white transition hover:bg-green-600">
                      {t('actions.save')}
                    </button>
                    <button onClick={handleCancelEdit} className="rounded-lg bg-gray-400 px-3 py-1 text-sm text-white transition hover:bg-gray-500">
                      {t('actions.cancel')}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleEditClick(user)} className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white transition hover:bg-blue-600">
                      {t('admin.users.editRole')}
                    </button>
                    <button onClick={() => handleDeleteUser(user)} className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white transition hover:bg-red-600">
                      {t('actions.delete')}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

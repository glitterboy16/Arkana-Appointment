import { useTranslation } from "react-i18next";
import AdminUsersTable from "../components/form/AdminUsersTable";

export default function AdminPage() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Panel de Administración de Usuarios</h1>
      <p className="app-muted mb-4">
        {t('admin.users.description')}
      </p>
      <AdminUsersTable />
    </div>
  );
}

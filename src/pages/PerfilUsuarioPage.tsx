import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Button from "../components/form/Button";
import { useTranslation } from "react-i18next";

export default function PerfilUsuarioPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!sessionUser) {
    return <div>No estás logueado.</div>;
  }

  const email = sessionUser.user?.email || t('profile.unavailableEmail');
  const username = sessionUser.profile?.username || t('navbar.userFallback');
  const avatarUrl = sessionUser.profile?.avatar_url || `https://ui-avatars.com/api/?name=${username}&background=random`;

  return (
    <div>
      <h1>{t('profile.title')}</h1>
      <img src={avatarUrl} alt={t('profile.avatarAlt', { user: username })} />
      <h2>{username}</h2>
      <p>{email}</p>
      <div>
        <Button type="button" onClick={() => navigate("/modificar-datos")}>
          {t('profile.editProfile')}
        </Button>
        {!isAdmin && (
          <Button type="button" onClick={() => navigate("/empresa")} variant="secondary">
            {t('profile.backToDashboard')}
          </Button>
        )}
      </div>
    </div>
  );
}

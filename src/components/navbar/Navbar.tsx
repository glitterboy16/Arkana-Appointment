import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, UserCircle, LogOut, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createUserRepository } from '../../database/repositories';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, sessionUser, clearSession } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const userRepository = createUserRepository();
  const navigate = useNavigate();

  const nombre = sessionUser?.profile?.username || t('navbar.userFallback');
  const avatar = sessionUser?.profile?.avatar_url;
  const tituloTema = theme === 'light' ? t('navbar.themeToDark') : t('navbar.themeToLight');

  const cerrarSesion = async () => {
    const { error } = await userRepository.logout();
    if (!error) {
      clearSession();
      navigate('/');
    }
  };

  return (
    <nav
      className="app-navbar sticky top-0 z-50 border-b"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: '#004AAD' }}
          >
            <img src="/assets/logo-icon.svg" alt="" className="h-5 w-5 object-contain brightness-[10]" />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: '#FAFAFA' }}>
            Arkana
            <span className="ml-0.5 font-light opacity-60">Appointments</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2.5">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={nombre}
                    className="h-8 w-8 rounded-full object-cover"
                    style={{ border: '1.5px solid rgba(255,255,255,0.15)' }}
                  />
                ) : (
                  <UserCircle size={22} style={{ color: 'rgba(250,250,250,0.60)' }} />
                )}
                <span className="text-sm font-medium" style={{ color: 'rgba(250,250,250,0.80)' }}>
                  {nombre}
                </span>
              </div>

              {!isAdmin && (
                <Link
                  to="/empresa"
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    background: 'rgba(100,141,255,0.12)',
                    color: '#648DFF',
                    textDecoration: 'none',
                  }}
                >
                  <LayoutDashboard size={13} />
                  {t('navbar.myAppointments')}
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-md px-3 py-1.5 text-xs font-semibold"
                  style={{ background: 'rgba(100,141,255,0.12)', color: '#648DFF', textDecoration: 'none' }}
                >
                  {t('navbar.admin')}
                </Link>
              )}

              <button
                onClick={cerrarSesion}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(250,250,250,0.60)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <LogOut size={13} />
                {t('navbar.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/iniciarSesion"
                className="rounded-md px-4 py-1.5 text-sm font-semibold transition-all"
                style={{ color: 'rgba(250,250,250,0.70)', textDecoration: 'none' }}
              >
                {t('navbar.login')}
              </Link>
              <Link
                to="/registro"
                className="btn-primary rounded-lg px-4 py-1.5 text-sm"
                style={{ textDecoration: 'none' }}
              >
                {t('navbar.createAccount')}
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            title={tituloTema}
            aria-label={tituloTema}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(250,250,250,0.55)' }}
          >
            {theme === 'light' ? <Moon size={15} strokeWidth={2} /> : <Sun size={15} strokeWidth={2} />}
          </button>

          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserRepository } from '../../database/repositories';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { validateField } from '../../utils/regex';
import { useTranslation } from 'react-i18next';

interface DatosFormularioProps {
  email: string;
  password: string;
}

interface ErrorsProps {
  email: string;
  password: string;
}

export default function IniciarSesion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const userRepository = createUserRepository();

  const [loading, setLoading] = useState(false);
  const [datosFormulario, setDatosFormulario] = useState<DatosFormularioProps>({ email: '', password: '' });
  const [errors, setErrors] = useState<ErrorsProps>({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatosFormulario({ ...datosFormulario, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      email: validateField('email', datosFormulario.email),
      password: validateField('password', datosFormulario.password),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const result = await userRepository.login(datosFormulario.email, datosFormulario.password);
      if (result.error) {
        toast.error(result.error.message || t('auth.login.invalidCredentials'));
      } else if (result.data) {
        const supabaseUser = result.data.user;
        if (!supabaseUser) { toast.error(t('auth.login.userInfoError')); return; }
        await setSession(result.data, supabaseUser);
        const { data: role } = result.data.profile?.id
          ? await userRepository.fetchRole(result.data.profile.id)
          : { data: null };
        toast.success(t('auth.login.welcomeBack'));
        navigate(role === 'admin' ? '/admin' : '/empresa');
      }
    } catch (err) {
      toast.error(t('auth.login.connectionError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium" style={{ color: 'rgba(250,250,250,0.55)' }}>
          {t('auth.fields.emailLabel')}
        </label>
        <input
          className="ark-input"
          id="email"
          type="email"
          name="email"
          placeholder={t('auth.fields.emailPlaceholder')}
          value={datosFormulario.email}
          onChange={handleChange}
          autoComplete="email"
        />
        {errors.email && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.email}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium" style={{ color: 'rgba(250,250,250,0.55)' }}>
          {t('auth.fields.passwordLabel')}
        </label>
        <input
          className="ark-input"
          id="password"
          type="password"
          name="password"
          placeholder={t('auth.fields.passwordPlaceholder')}
          value={datosFormulario.password}
          onChange={handleChange}
          autoComplete="current-password"
        />
        {errors.password && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.password}</p>}
        <div className="mt-2 flex justify-end">
          <Link to="/recuperarPass" className="text-xs font-medium no-underline" style={{ color: '#648DFF' }}>
            {t('auth.login.forgotPassword')}
          </Link>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary mt-1 w-full justify-center rounded-xl py-3.5 text-sm">
        {loading ? t('auth.login.submitting') : t('auth.login.submit')}
      </button>

      <p className="text-center text-xs" style={{ color: 'rgba(250,250,250,0.30)' }}>
        {t('auth.login.noAccount')}{' '}
        <Link to="/registro" className="font-semibold no-underline" style={{ color: '#648DFF' }}>
          {t('auth.login.createNow')}
        </Link>
      </p>
    </form>
  );
}

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowRight, CalendarCheck } from 'lucide-react';

export default function HeroSection() {
  const navegar = useNavigate();
  const { t } = useTranslation();
  const estaAutenticado = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="relative overflow-hidden px-6 py-24 text-center md:py-32">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: 700,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,74,173,0.28) 0%, transparent 70%)',
        }}
      />
      {/* Accent glow bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: 500,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(100,141,255,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-3xl">
        {/* Pill label */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
          style={{ background: 'rgba(100,141,255,0.12)', color: '#648DFF', border: '1px solid rgba(100,141,255,0.25)' }}>
          <CalendarCheck size={13} />
          Gestión de citas sin complicaciones
        </div>

        <h1
          className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl"
          style={{ color: '#FAFAFA', letterSpacing: '-0.03em' }}
        >
          {t('home.hero.title')}
        </h1>

        <p
          className="mx-auto mb-10 max-w-xl text-lg leading-relaxed"
          style={{ color: 'rgba(250,250,250,0.60)' }}
        >
          {t('home.hero.subtitle')}
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            className="btn-primary flex items-center gap-2 rounded-xl px-7 py-3.5 text-base"
            onClick={() => navegar(estaAutenticado ? '/empresa' : '/registro')}
          >
            {t('home.hero.start')}
            <ArrowRight size={16} />
          </button>

          <button
            className="btn-ghost rounded-xl px-7 py-3.5 text-base"
            onClick={() => navegar(estaAutenticado ? '/empresa' : '/iniciarSesion')}
          >
            {estaAutenticado ? t('home.hero.goToDashboard') : t('home.hero.haveAccount')}
          </button>
        </div>
      </div>
    </section>
  );
}

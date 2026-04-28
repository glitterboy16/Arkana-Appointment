import { Outlet } from 'react-router-dom';
import { QrCode, CalendarClock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import CardHome from '../components/home/CardHome';

export default function LandingLayout() {
  const { t } = useTranslation();

  const features = [
    { title: t('home.features.qr.title'), content: t('home.features.qr.content'), icon: <QrCode size={22} /> },
    { title: t('home.features.schedule.title'), content: t('home.features.schedule.content'), icon: <CalendarClock size={22} /> },
    { title: t('home.features.simple.title'), content: t('home.features.simple.content'), icon: <Zap size={22} /> },
  ];

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />

        {/* Features section */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl">
            <p
              className="mb-3 text-center text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(100,141,255,0.80)' }}
            >
              Funcionalidades
            </p>
            <h2
              className="mb-10 text-center text-3xl font-bold tracking-tight"
              style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}
            >
              Todo lo que necesitas, listo para usar
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {features.map((feature) => (
                <CardHome
                  key={feature.title}
                  title={feature.title}
                  content={feature.content}
                  icon={feature.icon}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      className="app-footer mt-auto border-t"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: '#004AAD' }}
          >
            <img src="/assets/logo-icon.svg" alt="" className="h-4 w-4 object-contain brightness-[10]" />
          </div>
          <span className="text-sm font-bold" style={{ color: '#FAFAFA' }}>
            Arkana<span className="font-light opacity-50"> Appointments</span>
          </span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(250,250,250,0.30)' }}>
          {t('footer.tagline')}
        </p>
        <p className="text-xs" style={{ color: 'rgba(250,250,250,0.25)' }}>
          © {new Date().getFullYear()} Arkana
        </p>
      </div>
    </footer>
  );
}

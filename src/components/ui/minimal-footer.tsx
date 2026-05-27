import { useState } from 'react';
import { BiLogoGithub, BiLogoLinkedin, BiPhone, BiEnvelope } from 'react-icons/bi';
import { LogoArkana } from '@/components/app/Shared';

const LINKEDIN_URL = '#';
const GITHUB_URL = 'https://github.com/glitterboy16/Arkana-Appointment';

export function MinimalFooter() {
  const year = new Date().getFullYear();
  const [contactoAbierto, setContactoAbierto] = useState(false);

  const company = [
    { title: 'Sobre nosotros', href: '/sobre-nosotros' },
    { title: 'Privacidad',     href: '/privacidad' },
    { title: 'Términos',       href: '/terminos' },
  ];

  const socialLinks = [
    { icon: <BiLogoGithub className="size-4" />, link: GITHUB_URL,   label: 'GitHub' },
    { icon: <BiLogoLinkedin className="size-4" />, link: LINKEDIN_URL, label: 'LinkedIn' },
  ];

  return (
    <footer className="relative" style={{ fontFamily: "'SF Pro Display','SF Pro Text','Inter',sans-serif" }}>
      <div className="mx-auto max-w-4xl border-border md:border-x">
        <div className="grid max-w-4xl grid-cols-6 gap-6 p-4">

          {/* Branding */}
          <div className="col-span-6 flex flex-col gap-5 md:col-span-4">
            <a href="/" className="flex w-max items-center gap-2.5 no-underline">
              <LogoArkana size={44} />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Arkana
                <span className="ml-1 font-light text-muted-foreground">Appointments</span>
              </span>
            </a>
            <p
              className="max-w-sm text-sm text-balance text-muted-foreground"
              style={{ fontFamily: "'SF Pro Text','Inter',sans-serif" }}
            >
              La plataforma de citas para negocios que reservan con un QR.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  className="rounded-md border border-border p-1.5 text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                  target="_blank"
                  rel="noreferrer noopener"
                  href={item.link}
                  aria-label={item.label}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Recursos */}
          <div className="col-span-3 w-full md:col-span-1">
            <span className="mb-1 text-xs text-muted-foreground">Recursos</span>
            <div className="flex flex-col gap-1">
              {/* Contacto interactivo */}
              <button
                type="button"
                onClick={() => setContactoAbierto(v => !v)}
                className="w-max py-1 text-sm text-foreground/80 duration-200 hover:underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit', textAlign: 'left' }}
              >
                Contacto
              </button>
              <div className={`ark-contact-panel ${contactoAbierto ? 'ark-contact-panel--open' : 'ark-contact-panel--closed'}`}>
                <div className="ark-contact-panel__inner">
                  <div
                    style={{
                      background: 'var(--app-surface, rgba(255,255,255,0.04))',
                      border: '1px solid var(--app-border, rgba(255,255,255,0.10))',
                      borderRadius: 8,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 7,
                      marginBottom: 4,
                    }}
                  >
                    <a
                      href="tel:+34632956059"
                      style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--app-text, #FAFAFA)', textDecoration: 'none', opacity: 0.8 }}
                    >
                      <BiPhone size={13} style={{ flexShrink: 0 }} />
                      +34 632 95 60 59
                    </a>
                    <a
                      href="mailto:support@arkana-appointments.com"
                      style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--app-text, #FAFAFA)', textDecoration: 'none', opacity: 0.8 }}
                    >
                      <BiEnvelope size={13} style={{ flexShrink: 0 }} />
                      support@arkana-appointments.com
                    </a>
                  </div>
                </div>
              </div>
              <a className="w-max py-1 text-sm text-foreground/80 no-underline duration-200 hover:underline" href="/estado">
                Estado del servicio
              </a>
              <a className="w-max py-1 text-sm text-foreground/80 no-underline duration-200 hover:underline" href="/seguridad">
                Seguridad
              </a>
            </div>
          </div>

          {/* Negocio */}
          <div className="col-span-3 w-full md:col-span-1">
            <span className="mb-1 text-xs text-muted-foreground">Negocio</span>
            <div className="flex flex-col gap-1">
              {company.map(({ href, title }, i) => (
                <a
                  key={i}
                  className="w-max py-1 text-sm text-foreground/80 no-underline duration-200 hover:underline"
                  href={href}
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border" />
        <div className="flex max-w-4xl flex-col justify-between gap-2 pb-5 pt-4">
          <p className="text-xs font-light text-muted-foreground">
            © {year} Arkana Appointments. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

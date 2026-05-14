import { BiLogoGithub, BiLogoLinkedin } from 'react-icons/bi';
import { LogoArkana } from '@/components/app/Shared';

// TODO: reemplazar por la URL real de LinkedIn de Angel cuando la pase
const LINKEDIN_URL = '#';
const GITHUB_URL = 'https://github.com/glitterboy16/Arkana-Appointment';

export function MinimalFooter() {
  const year = new Date().getFullYear();

  const company = [
    { title: 'Sobre nosotros', href: '#' },
    { title: 'Trabaja con nosotros', href: '#' },
    { title: 'Marca y prensa', href: '#' },
    { title: 'Privacidad', href: '#' },
    { title: 'Términos', href: '#' },
  ];

  const resources = [
    { title: 'Blog', href: '#' },
    { title: 'Centro de ayuda', href: '#' },
    { title: 'Contacto', href: '#' },
    { title: 'Estado del servicio', href: '#' },
    { title: 'Seguridad', href: '#' },
  ];

  const socialLinks = [
    { icon: <BiLogoGithub className="size-4" />, link: GITHUB_URL, label: 'GitHub' },
    { icon: <BiLogoLinkedin className="size-4" />, link: LINKEDIN_URL, label: 'LinkedIn' },
  ];

  return (
    <footer className="relative" style={{ fontFamily: "'SF Pro Display','SF Pro Text','Inter',sans-serif" }}>
      <div className="mx-auto max-w-4xl border-white/10 md:border-x">
        <div className="grid max-w-4xl grid-cols-6 gap-6 p-4">
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
                  className="rounded-md border border-white/10 p-1.5 text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
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
          <div className="col-span-3 w-full md:col-span-1">
            <span className="mb-1 text-xs text-muted-foreground">Recursos</span>
            <div className="flex flex-col gap-1">
              {resources.map(({ href, title }, i) => (
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
        <div className="border-t border-white/10" />
        <div className="flex max-w-4xl flex-col justify-between gap-2 pb-5 pt-4">
          <p className="text-center text-xs font-light text-muted-foreground">
            © {year} Arkana Appointments. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

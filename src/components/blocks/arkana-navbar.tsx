import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { LogoArkana } from '@/components/app/Shared';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface ArkanaNavbarProps {
  logo?: {
    url: string;
    title: string;
  };
  auth?: {
    login: { text: string; url: string };
    signup: { text: string; url: string };
  };
}

const isInternal = (url: string) => url.startsWith('/');

const Anchor = ({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) =>
  isInternal(href) ? (
    <Link to={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );

// Navbar minimal: hasta que existan secciones de producto, precios y blog
// reales, dejar dropdowns vacíos rompe la confianza. Mejor un navbar limpio
// estilo Linear/Raycast con marca + acceso/registro y nada más.

export function ArkanaNavbar({
  logo = { url: '/', title: 'Arkana' },
  auth = {
    login: { text: 'Iniciar sesión', url: '/iniciarSesion' },
    signup: { text: 'Crear cuenta', url: '/registro' },
  },
}: ArkanaNavbarProps) {
  return (
    <section className="sticky top-0 z-50 bg-background/70 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 lg:px-6 lg:py-4">
        <nav className="hidden items-center justify-between lg:flex">
          <Anchor href={logo.url} className="flex items-center gap-2.5 no-underline">
            <LogoArkana size={44} />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {logo.title}
              <span className="ml-1 font-light text-muted-foreground">Appointments</span>
            </span>
          </Anchor>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 rounded-md px-4 border-border bg-transparent text-foreground hover:bg-accent"
            >
              <Anchor href={auth.login.url}>{auth.login.text}</Anchor>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-9 rounded-md px-4 bg-brand text-white hover:bg-brand/90"
            >
              <Anchor href={auth.signup.url}>{auth.signup.text}</Anchor>
            </Button>
          </div>
        </nav>

        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <Anchor href={logo.url} className="flex items-center gap-2.5 no-underline">
              <LogoArkana size={44} />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {logo.title}
              </span>
            </Anchor>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Abrir menú">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <Anchor href={logo.url} className="flex items-center gap-2.5 no-underline">
                        <LogoArkana size={44} />
                        <span className="text-lg font-semibold tracking-tight text-foreground">
                          {logo.title} Appointments
                        </span>
                      </Anchor>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="my-6 flex flex-col gap-3">
                    <Button asChild variant="outline">
                      <Anchor href={auth.login.url}>{auth.login.text}</Anchor>
                    </Button>
                    <Button asChild className="bg-brand text-white hover:bg-brand/90">
                      <Anchor href={auth.signup.url}>{auth.signup.text}</Anchor>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

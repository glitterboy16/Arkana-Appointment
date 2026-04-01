import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Book,
  CalendarClock,
  HelpCircle,
  LifeBuoy,
  Menu,
  MessageCircle,
  QrCode,
  Sparkles,
  Zap,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: ReactNode;
  items?: MenuItem[];
}

interface ArkanaNavbarProps {
  logo?: {
    url: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: { name: string; url: string }[];
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

const defaultMenu: MenuItem[] = [
  { title: 'Inicio', url: '/' },
  {
    title: 'Producto',
    url: '#',
    items: [
      {
        title: 'QR único por negocio',
        description: 'Cada negocio con su propio código para reservar al instante',
        icon: <QrCode className="size-5 shrink-0" />,
        url: '#qr',
      },
      {
        title: 'Reservas online',
        description: 'Tus clientes ven huecos libres y eligen sin registrarse',
        icon: <CalendarClock className="size-5 shrink-0" />,
        url: '#reservas',
      },
      {
        title: 'Notificaciones por WhatsApp',
        description: 'Recordatorios automáticos para reducir las no-shows',
        icon: <MessageCircle className="size-5 shrink-0" />,
        url: '#whatsapp',
      },
      {
        title: 'Panel del negocio',
        description: 'Gestiona servicios, horarios y citas en un solo sitio',
        icon: <Sparkles className="size-5 shrink-0" />,
        url: '#panel',
      },
    ],
  },
  {
    title: 'Recursos',
    url: '#',
    items: [
      {
        title: 'Centro de ayuda',
        description: 'Guías paso a paso para sacar partido a Arkana',
        icon: <HelpCircle className="size-5 shrink-0" />,
        url: '#ayuda',
      },
      {
        title: 'Contacto',
        description: 'Habla con nosotros y resolvemos tus dudas',
        icon: <LifeBuoy className="size-5 shrink-0" />,
        url: '#contacto',
      },
      {
        title: 'Estado del servicio',
        description: 'Comprueba el estado de la plataforma en vivo',
        icon: <Zap className="size-5 shrink-0" />,
        url: '#estado',
      },
      {
        title: 'Términos y privacidad',
        description: 'Cómo usamos tus datos y los de tus clientes',
        icon: <Book className="size-5 shrink-0" />,
        url: '#legal',
      },
    ],
  },
  { title: 'Precios', url: '#precios' },
  { title: 'Blog', url: '#blog' },
];

const defaultMobileExtraLinks = [
  { name: 'Contacto', url: '#contacto' },
  { name: 'Ayuda', url: '#ayuda' },
  { name: 'Privacidad', url: '#legal' },
  { name: 'Términos', url: '#legal' },
];

export function ArkanaNavbar({
  logo = { url: '/', title: 'Arkana' },
  menu = defaultMenu,
  mobileExtraLinks = defaultMobileExtraLinks,
  auth = {
    login: { text: 'Iniciar sesión', url: '/iniciarSesion' },
    signup: { text: 'Crear cuenta', url: '/registro' },
  },
}: ArkanaNavbarProps) {
  return (
    <section className="sticky top-0 z-50 bg-background/70 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 lg:px-6 lg:py-4">
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            <Anchor href={logo.url} className="flex items-center gap-2 no-underline">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: '#004AAD' }}
              >
                <CalendarClock className="size-4 text-white" />
              </span>
              <span className="text-base font-semibold tracking-tight text-foreground">
                {logo.title}
                <span className="ml-1 font-light text-muted-foreground">Appointments</span>
              </span>
            </Anchor>
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => renderMenuItem(item))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 rounded-md px-4 border-white/15 bg-white/5 text-foreground hover:bg-white/10"
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
            <Anchor href={logo.url} className="flex items-center gap-2 no-underline">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: '#004AAD' }}
              >
                <CalendarClock className="size-4 text-white" />
              </span>
              <span className="text-base font-semibold tracking-tight text-foreground">
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
                    <Anchor href={logo.url} className="flex items-center gap-2 no-underline">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: '#004AAD' }}
                      >
                        <CalendarClock className="size-4 text-white" />
                      </span>
                      <span className="text-base font-semibold tracking-tight text-foreground">
                        {logo.title} Appointments
                      </span>
                    </Anchor>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="border-t py-4">
                    <div className="grid grid-cols-2 justify-start">
                      {mobileExtraLinks.map((link, idx) => (
                        <Anchor
                          key={idx}
                          href={link.url}
                          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-accent-foreground"
                        >
                          {link.name}
                        </Anchor>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline">
                      <Anchor href={auth.login.url}>{auth.login.text}</Anchor>
                    </Button>
                    <Button asChild className="bg-brand text-white hover:bg-brand/90">
                      <Anchor href={auth.signup.url}>{auth.signup.text}</Anchor>
                    </Button>
                  </div>
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

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className="text-muted-foreground">
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-80 p-3">
            <NavigationMenuLink asChild>
              <div>
                {item.items.map((subItem) => (
                  <Anchor
                    key={subItem.title}
                    href={subItem.url}
                    className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
                  >
                    {subItem.icon}
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-sm leading-snug text-muted-foreground">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </Anchor>
                ))}
              </div>
            </NavigationMenuLink>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }
  return (
    <Anchor
      key={item.title}
      href={item.url}
      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-accent-foreground"
    >
      {item.title}
    </Anchor>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <Anchor
              key={subItem.title}
              href={subItem.url}
              className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
            >
              {subItem.icon}
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {subItem.title}
                </div>
                {subItem.description && (
                  <p className="text-sm leading-snug text-muted-foreground">
                    {subItem.description}
                  </p>
                )}
              </div>
            </Anchor>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }
  return (
    <Anchor key={item.title} href={item.url} className="font-semibold no-underline">
      {item.title}
    </Anchor>
  );
};

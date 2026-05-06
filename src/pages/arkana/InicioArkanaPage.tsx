import { ArkanaNavbar } from '@/components/blocks/arkana-navbar';
import { HeroWithMockup } from '@/components/blocks/hero-with-mockup';
import { Dashboard3D } from '@/components/blocks/dashboard-3d';
import { MinimalFooter } from '@/components/ui/minimal-footer';

export default function InicioArkanaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ArkanaNavbar />
      <main className="flex-1">
        <HeroWithMockup
          title="Reserva citas con un QR. Sin descargas, sin registros."
          description="Arkana Appointments da a tu negocio una página propia con código QR único. Tus clientes escanean, eligen hueco y reservan en segundos."
          primaryCta={{
            text: 'Crear cuenta gratis',
            href: '/registro',
          }}
          secondaryCta={{
            text: 'Iniciar sesión',
            href: '/iniciarSesion',
          }}
        />
        <Dashboard3D />
      </main>
      <MinimalFooter />
    </div>
  );
}

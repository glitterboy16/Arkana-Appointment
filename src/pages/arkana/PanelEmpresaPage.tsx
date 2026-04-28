import { useMemo, useState } from 'react';
import TarjetaCita from '../../components/citas/TarjetaCita';
import { citasMock } from '../../database/data';
import type { Cita, EstadoCita } from '../../interfaces/Cita';

export default function PanelEmpresaPage() {
  const [citas, setCitas] = useState<Cita[]>(citasMock);

  const cambiarEstado = (citaId: string, estado: EstadoCita) => {
    setCitas((actuales) => actuales.map((cita) => (cita.id === citaId ? { ...cita, estado } : cita)));
  };

  const resumen = useMemo(() => {
    return {
      total: citas.length,
      pendientes: citas.filter((cita) => cita.estado === 'pendiente').length,
      confirmadas: citas.filter((cita) => cita.estado === 'confirmada').length,
    };
  }, [citas]);

  return (
    <section>
      <h2>Panel de empresa</h2>
      <p>Total de citas: {resumen.total}</p>
      <p>Pendientes: {resumen.pendientes} · Confirmadas: {resumen.confirmadas}</p>
      <div style={{ display: 'grid', gap: 12 }}>
        {citas.map((cita) => (
          <TarjetaCita key={cita.id} cita={cita} onCambiarEstado={cambiarEstado} />
        ))}
      </div>
    </section>
  );
}

import type { Cita, EstadoCita } from '../../interfaces/Cita';

interface TarjetaCitaProps {
  cita: Cita;
  onCambiarEstado: (citaId: string, estado: EstadoCita) => void;
}

const coloresPorEstado: Record<EstadoCita, string> = {
  pendiente: '#f59e0b',
  confirmada: '#10b981',
  rechazada: '#ef4444',
  reprogramada: '#3b82f6',
  cancelada: '#6b7280',
};

export default function TarjetaCita({ cita, onCambiarEstado }: TarjetaCitaProps) {
  return (
    <article
      style={{
        border: '1px solid #dbe3f0',
        borderRadius: 12,
        padding: 16,
        background: '#fff',
      }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>Cita #{cita.id}</p>
      <p style={{ margin: '8px 0 0 0' }}>
        Fecha: {cita.fecha} · {cita.horaInicio} - {cita.horaFin}
      </p>
      <p style={{ margin: '8px 0' }}>
        Estado:{' '}
        <strong style={{ color: coloresPorEstado[cita.estado], textTransform: 'capitalize' }}>{cita.estado}</strong>
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => onCambiarEstado(cita.id, 'confirmada')}>Confirmar</button>
        <button onClick={() => onCambiarEstado(cita.id, 'rechazada')}>Rechazar</button>
        <button onClick={() => onCambiarEstado(cita.id, 'reprogramada')}>Reprogramar</button>
      </div>
    </article>
  );
}

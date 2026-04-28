import { Link, useParams } from 'react-router-dom';
import { negociosMock } from '../../database/data';

export default function PerfilNegocioPage() {
  const { codigoQr } = useParams();
  const negocio = negociosMock.find((item) => item.codigoQr === codigoQr);

  if (!negocio) {
    return (
      <section>
        <h2>Negocio no encontrado</h2>
        <Link to="/">Volver al inicio</Link>
      </section>
    );
  }

  return (
    <section>
      <h2>{negocio.nombreComercial}</h2>
      <p>{negocio.descripcion}</p>
      <p>Dirección: {negocio.direccion}</p>
      <p>Contacto: {negocio.telefono} · {negocio.correoContacto}</p>
      <Link to="/reservar">Solicitar cita</Link>
    </section>
  );
}

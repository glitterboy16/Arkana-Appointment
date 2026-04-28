import { Link } from 'react-router-dom';

export default function InicioArkanaPage() {
  return (
    <section>
      <h1>Arkana Appointments</h1>
      <p>Gestión de citas para negocios con reservas simples y rápidas.</p>
      <ul>
        <li>
          <Link to="/negocio/arkana-neg-001">Ver perfil público del negocio (QR)</Link>
        </li>
        <li>
          <Link to="/empresa">Panel de empresa</Link>
        </li>
        <li>
          <Link to="/admin">Panel de administrador</Link>
        </li>
      </ul>
    </section>
  );
}

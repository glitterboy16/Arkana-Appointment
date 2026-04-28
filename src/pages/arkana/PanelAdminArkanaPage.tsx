import { negociosMock, usuariosMock } from '../../database/data';

export default function PanelAdminArkanaPage() {
  const empresasActivas = usuariosMock.filter((usuario) => usuario.rol === 'empresa' && usuario.activo).length;

  return (
    <section>
      <h2>Panel administrador</h2>
      <p>Negocios registrados: {negociosMock.length}</p>
      <p>Empresas activas: {empresasActivas}</p>
      <p>Incidencias: 0 (demo inicial)</p>
    </section>
  );
}

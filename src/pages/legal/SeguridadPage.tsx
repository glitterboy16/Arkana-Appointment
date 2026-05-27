import LegalLayout from './LegalLayout';

export default function SeguridadPage() {
  return (
    <LegalLayout title="Seguridad" updated="19 de mayo de 2026">
      <h2>Nuestro enfoque</h2>
      <p>
        La seguridad de los datos de nuestros usuarios es una prioridad, no un añadido.
        Arkana está construida sobre infraestructura moderna con controles de acceso estrictos
        en cada capa.
      </p>

      <h2>Autenticación</h2>
      <ul>
        <li>
          Las contraseñas se almacenan cifradas con <strong>bcrypt</strong> (factor de coste 10).
          Nunca guardamos contraseñas en texto plano.
        </li>
        <li>
          Las sesiones se gestionan mediante <strong>JWT firmados</strong> con rotación automática.
          Los tokens de refresco tienen vida limitada.
        </li>
        <li>
          La verificación de email y la recuperación de contraseña se realizan mediante
          <strong> enlaces de un solo uso</strong> con caducidad de 24 horas y 1 hora respectivamente.
        </li>
      </ul>

      <h2>Cifrado y transporte</h2>
      <ul>
        <li>
          Toda la comunicación entre tu dispositivo y nuestros servidores viaja cifrada
          con <strong>TLS 1.2 o superior</strong>.
        </li>
        <li>
          Los datos en reposo están cifrados en el nivel de infraestructura por parte de
          <strong> Supabase</strong> (proveedor de base de datos certificado SOC 2 Tipo II).
        </li>
      </ul>

      <h2>Control de acceso</h2>
      <p>
        Arkana implementa <strong>Row Level Security (RLS)</strong> directamente en la base de
        datos. Cada usuario solo puede leer y modificar sus propios datos; las operaciones
        administrativas requieren un rol explícito y se realizan a través de funciones con
        privilegios definidos, no con credenciales de superusuario.
      </p>

      <h2>Privacidad por diseño</h2>
      <ul>
        <li>No usamos cookies de seguimiento ni perfiles publicitarios.</li>
        <li>No vendemos ni cedemos datos a terceros con fines comerciales.</li>
        <li>Recogemos el mínimo de datos necesario para prestar el servicio.</li>
      </ul>

      <h2>Proveedores de infraestructura</h2>
      <ul>
        <li>
          <strong>Supabase</strong> — base de datos PostgreSQL y autenticación.
          Cumple SOC 2 Tipo II y RGPD.
        </li>
        <li>
          <strong>Vercel</strong> — hosting y edge network. Cumple ISO 27001 y SOC 2.
        </li>
      </ul>

      <h2>Reporte de vulnerabilidades</h2>
      <p>
        Si has encontrado una vulnerabilidad de seguridad, te pedimos que nos lo comuniques
        de forma responsable antes de hacerlo público. Escríbenos a{' '}
        <a href="mailto:support@arkana-appointments.com">support@arkana-appointments.com</a>{' '}
        con el asunto <strong>"Vulnerabilidad"</strong>. Respondemos en un plazo máximo de 72 horas.
      </p>
    </LegalLayout>
  );
}

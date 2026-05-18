import LegalLayout from './LegalLayout';

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de privacidad" updated="19 de mayo de 2026">
      <h2>1. Responsable del tratamiento</h2>
      <p>
        Arkana Appointments (en adelante, “Arkana”) es responsable del tratamiento de los datos
        personales recogidos a través de esta plataforma. Puedes contactar con nosotros en{' '}
        <a href="mailto:hola@arkana-appointments.com">hola@arkana-appointments.com</a>.
      </p>

      <h2>2. Datos que recogemos</h2>
      <ul>
        <li>
          <strong>Cuentas de negocio:</strong> nombre, email, teléfono, dirección, categoría, logo,
          servicios y horarios publicados.
        </li>
        <li>
          <strong>Cuentas de cliente:</strong> nombre, email, teléfono y foto de perfil opcional.
        </li>
        <li>
          <strong>Reservas:</strong> negocio, servicio, fecha, hora y datos de contacto facilitados
          para la cita.
        </li>
        <li>
          <strong>Datos técnicos mínimos:</strong> mensajes de error técnicos para mantener el
          servicio en funcionamiento. No usamos cookies de seguimiento ni perfiles publicitarios.
        </li>
      </ul>

      <h2>3. Finalidad</h2>
      <p>
        Tratamos tus datos únicamente para prestar el servicio de gestión de citas: crear tu
        cuenta, mostrar tu perfil público, permitir reservas, enviar confirmaciones y mantener el
        historial de citas.
      </p>

      <h2>4. Base legal</h2>
      <p>
        La base legal es la <strong>ejecución del contrato</strong> que aceptas al registrarte y,
        en su caso, el <strong>consentimiento</strong> expreso que otorgas (por ejemplo, al subir
        una foto de perfil).
      </p>

      <h2>5. Conservación</h2>
      <p>
        Conservamos los datos mientras tu cuenta esté activa. Si solicitas la baja, los eliminamos
        en un plazo máximo de 30 días, salvo obligación legal de conservación.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer en cualquier momento tus derechos de <strong>acceso, rectificación, supresión,
        oposición, limitación y portabilidad</strong> escribiendo a{' '}
        <a href="mailto:privacidad@arkana-appointments.com">privacidad@arkana-appointments.com</a>.
        También puedes presentar una reclamación ante la Agencia Española de Protección de Datos
        (<a href="https://www.aepd.es" target="_blank" rel="noreferrer">aepd.es</a>).
      </p>

      <h2>7. Encargados del tratamiento</h2>
      <p>
        Usamos los siguientes proveedores, todos con garantías RGPD:
      </p>
      <ul>
        <li><strong>Supabase</strong> — base de datos y autenticación (UE).</li>
        <li><strong>Vercel</strong> — alojamiento de la aplicación.</li>
        <li><strong>Mapbox</strong> — visualización de mapas en la ficha del negocio.</li>
      </ul>

      <h2>8. Cambios</h2>
      <p>
        Si actualizamos esta política, indicaremos la nueva fecha al inicio de este documento y
        notificaremos a los usuarios cuyos derechos puedan verse afectados.
      </p>
    </LegalLayout>
  );
}

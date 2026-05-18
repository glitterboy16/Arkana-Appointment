import LegalLayout from './LegalLayout';

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos de uso" updated="19 de mayo de 2026">
      <h2>1. Objeto</h2>
      <p>
        Estos términos regulan el uso de Arkana Appointments, una plataforma que permite a los
        negocios publicar un perfil con código QR para que sus clientes reserven citas sin
        descargar ninguna aplicación.
      </p>

      <h2>2. Aceptación</h2>
      <p>
        Al crear una cuenta o reservar una cita declaras haber leído y aceptado estos términos y la{' '}
        <a href="/privacidad">política de privacidad</a>. Si no estás de acuerdo, no utilices el
        servicio.
      </p>

      <h2>3. Cuentas</h2>
      <ul>
        <li>Debes proporcionar información veraz y mantenerla actualizada.</li>
        <li>Eres responsable de la custodia de tus credenciales y de la actividad de tu cuenta.</li>
        <li>
          Las cuentas de negocio son responsables del contenido publicado en su perfil y de
          atender las reservas confirmadas.
        </li>
      </ul>

      <h2>4. Uso aceptable</h2>
      <p>No está permitido:</p>
      <ul>
        <li>Publicar contenido ilícito, ofensivo, fraudulento o que infrinja derechos de terceros.</li>
        <li>Reservar citas con intención de no acudir o entorpecer la actividad de un negocio.</li>
        <li>Intentar acceder a cuentas ajenas o realizar ingeniería inversa de la plataforma.</li>
        <li>Recoger datos de otros usuarios mediante scraping u otras técnicas automatizadas.</li>
      </ul>

      <h2>5. Cancelaciones</h2>
      <p>
        El cliente puede cancelar sus citas próximas desde su panel. Cada negocio puede definir su
        propia política de cancelación, que prevalece sobre las condiciones generales.
      </p>

      <h2>6. Disponibilidad del servicio</h2>
      <p>
        Hacemos lo posible por mantener Arkana disponible 24/7, pero no garantizamos un uptime
        ininterrumpido. Podemos realizar tareas de mantenimiento programado avisando con
        antelación cuando sea posible.
      </p>

      <h2>7. Limitación de responsabilidad</h2>
      <p>
        Arkana es un intermediario tecnológico. No somos parte en la relación entre el cliente y
        el negocio y no respondemos por la calidad del servicio prestado, salvo en lo que respecta
        al correcto funcionamiento de la plataforma.
      </p>

      <h2>8. Baja y eliminación de cuenta</h2>
      <p>
        Puedes solicitar la baja desde la sección de configuración de tu cuenta o escribiendo a{' '}
        <a href="mailto:hola@arkana-appointments.com">hola@arkana-appointments.com</a>. Procederemos
        en un plazo máximo de 30 días.
      </p>

      <h2>9. Legislación aplicable</h2>
      <p>
        Estos términos se rigen por la legislación española. Para cualquier controversia, las
        partes se someten a los Juzgados y Tribunales del domicilio del consumidor o, en su
        defecto, de la ciudad donde Arkana tenga su sede.
      </p>
    </LegalLayout>
  );
}

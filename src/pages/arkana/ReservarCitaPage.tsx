import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReservarCitaPage() {
  const navigate = useNavigate();
  const [nombreCliente, setNombreCliente] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const enviarSolicitud = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!nombreCliente || !fecha || !hora) {
      alert('Completa todos los campos.');
      return;
    }

    alert(`Solicitud enviada para ${nombreCliente} el ${fecha} a las ${hora}`);
    navigate('/empresa');
  };

  return (
    <section>
      <h2>Solicitar cita</h2>
      <form onSubmit={enviarSolicitud} style={{ display: 'grid', gap: 12, maxWidth: 340 }}>
        <input value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} placeholder="Nombre" />
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        <button type="submit">Enviar solicitud</button>
      </form>
    </section>
  );
}

import React, { useState } from 'react';
import Videoconferencia from '../components/conferencias/Videoconferencia';
import { db, analytics } from '../database/firebaseconfig';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import '../styles/Conferencias.css';
import { useNavigate } from 'react-router-dom';
import { logEvent } from 'firebase/analytics';

const Conferencia = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [platform, setPlatform] = useState('interna');
  const [inMeeting, setInMeeting] = useState(false);
  const navigate = useNavigate();

  const handleStartMeeting = async () => {
    if (!roomName || !displayName) {
      alert("Por favor completa todos los campos");
      return;
    }

    let enlace = '';
    if (platform !== 'interna') {
      enlace = prompt(`Pega aquí el enlace de la reunión en ${platform.toUpperCase()}`);
      if (!enlace) {
        alert("Debes proporcionar el enlace externo para continuar.");
        return;
      }
    }

    try {
      await addDoc(collection(db, 'videoconferencias'), {
        roomName,
        displayName,
        plataforma: platform,
        enlace: platform === 'interna' ? null : enlace,
        fecha: serverTimestamp(),
      });
      logEvent(analytics, 'registro_conferencia', { accion: 'registro', origen: 'conferencias' });
      logEvent(analytics, 'ver_conferencia', { roomName, displayName, plataforma: platform });

      if (platform !== 'interna') {
        window.open(enlace, '_blank');
      }

      setInMeeting(true);
    } catch (error) {
      console.error("Error al guardar la videollamada:", error);
    }
  };

  const handleGoToHistorial = () => {
    logEvent(analytics, 'navegacion_historial_conferencias', {});
    navigate('/hisconferencia');
  };

  return (
    <div className="programarClase-container">
      <main className="main-panel">
        {inMeeting ? (
          platform === 'interna' ? (
            <Videoconferencia roomName={roomName} displayName={displayName} />
          ) : (
            <div className="externa-redirect">
              <h2>Clase abierta en {platform.toUpperCase()}</h2>
              <p>La videollamada se abrió en otra pestaña.</p>
            </div>
          )
        ) : (
          <div className="formulario">
            <h2>Programar Clase</h2>
            <input
              type="text"
              placeholder="Nombre de la clase"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Tu nombre"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="interna">Videollamada Interna (Jitsi)</option>
              <option value="zoom">Zoom</option>
              <option value="meet">Google Meet</option>
              <option value="discord">Discord</option>
            </select>
            <button onClick={handleStartMeeting}>Iniciar Videollamada</button>

            <button onClick={handleGoToHistorial} className="boton-historial">
              Ver historial de videollamadas
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Conferencia;

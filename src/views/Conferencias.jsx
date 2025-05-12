import React, { useState } from 'react';
import Videoconferencia from '../components/conferencias/Videoconferencia';
import { db } from '../database/firebaseconfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/Conferencias.css';
import { useNavigate } from 'react-router-dom';

// Modal de alerta flotante
const ModalAlerta = ({ mensaje, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-contenido">
      <p>{mensaje}</p>
      <button onClick={onClose}>Cerrar</button>
    </div>
  </div>
);

// Modal para ingresar enlace externo
const ModalEntradaEnlace = ({ plataforma, onAceptar, onCancelar }) => {
  const [valorInput, setValorInput] = useState('');

  const manejarAceptar = () => {
    if (!valorInput.trim()) return;
    onAceptar(valorInput.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h3>Pega aquí el enlace de la reunión en {plataforma.toUpperCase()}</h3>
        <input
          type="text"
          value={valorInput}
          onChange={(e) => setValorInput(e.target.value)}
          placeholder="https://..."
          style={{ width: '100%', padding: '8px', marginTop: '10px' }}
        />
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onCancelar}>Cancelar</button>
          <button onClick={manejarAceptar}>Aceptar</button>
        </div>
      </div>
    </div>
  );
};

const Conferencia = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [platform, setPlatform] = useState('interna');
  const [enlace, setEnlace] = useState('');
  const [inMeeting, setInMeeting] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [mostrarModalEnlace, setMostrarModalEnlace] = useState(false);
  const navigate = useNavigate();

  const handleStartMeeting = () => {
    if (!roomName || !displayName) {
      setMensajeAlerta("Por favor completa todos los campos");
      return;
    }

    if (platform !== 'interna') {
      setMostrarModalEnlace(true); // abrir modal personalizado
    } else {
      guardarVideollamada(null);
    }
  };

  const guardarVideollamada = async (enlaceFinal) => {
    try {
      await addDoc(collection(db, 'videoconferencias'), {
        roomName,
        displayName,
        plataforma: platform,
        enlace: platform === 'interna' ? null : enlaceFinal,
        fecha: serverTimestamp(),
      });

      if (platform !== 'interna') {
        setEnlace(enlaceFinal);
      }

      setInMeeting(true);
    } catch (error) {
      console.error("Error al guardar la videollamada:", error);
      setMensajeAlerta("Hubo un error al guardar la videollamada.");
    }
  };

  const handleAceptarEnlace = (inputEnlace) => {
    if (!inputEnlace) {
      setMensajeAlerta("Debes proporcionar el enlace externo para continuar.");
      return;
    }
    setMostrarModalEnlace(false);
    guardarVideollamada(inputEnlace);
  };

  const handleCancelarEnlace = () => {
    setMostrarModalEnlace(false);
  };

  const handleGoToHistorial = () => {
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
              <h2>Clase en {platform.toUpperCase()}</h2>
              <iframe
                src={enlace}
                title="Videollamada Externa"
                width="100%"
                height="600px"
                style={{ border: 'none' }}
                allow="camera; microphone; fullscreen; display-capture"
              />
              <button className="volver-btn" onClick={() => setInMeeting(false)}>Volver</button>
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

      {mensajeAlerta && (
        <ModalAlerta mensaje={mensajeAlerta} onClose={() => setMensajeAlerta('')} />
      )}

      {mostrarModalEnlace && (
        <ModalEntradaEnlace
          plataforma={platform}
          onAceptar={handleAceptarEnlace}
          onCancelar={handleCancelarEnlace}
        />
      )}
    </div>
  );
};

export default Conferencia;

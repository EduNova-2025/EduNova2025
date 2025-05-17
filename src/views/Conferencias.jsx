import React, { useState, useEffect } from 'react';
import Videoconferencia from '../components/conferencias/Videoconferencia';
import { db } from '../database/firebaseconfig';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import '../styles/Conferencias.css';
import { useNavigate } from 'react-router-dom';
// --- Add this import for the bell icon ---
import { BsBell } from 'react-icons/bs';

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

// Floating notification component
const FloatingNotification = ({ notification, onClose, onJoin }) => (
  <div style={{
    position: 'fixed',
    bottom: 30,
    right: 30,
    background: '#fff',
    border: '1px solid #007bff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    padding: 16,
    zIndex: 2000,
    minWidth: 280
  }}>
    <div style={{ marginBottom: 8 }}>{notification.mensaje}</div>
    {notification.enlace && (
      <button onClick={onJoin} style={{ marginRight: 8, background: '#007bff', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4 }}>
        Unirse
      </button>
    )}
    <button onClick={onClose} style={{ background: '#ccc', border: 'none', padding: '6px 12px', borderRadius: 4 }}>
      Cerrar
    </button>
  </div>
);

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

    if (platform === 'interna') {
      guardarVideollamada(null);
    } else {
      setMostrarModalEnlace(true);
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

      // --- BEGIN: Add notification creation ---
      await addDoc(collection(db, 'notificaciones'), {
        tipo: 'videollamada',
        mensaje: `${displayName} ha iniciado una videollamada: ${roomName}`,
        roomName,
        plataforma: platform,
        enlace: platform === 'interna' ? null : enlaceFinal,
        fecha: serverTimestamp(),
        leidoPor: [], // Puedes usar esto para marcar quién ya vio la notificación
      });
      // --- END: Add notification creation ---

      if (platform !== 'interna') {
        setEnlace(enlaceFinal);
        window.open(enlaceFinal, '_blank');
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

  const [notificaciones, setNotificaciones] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'notificaciones'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotificaciones(notifs);
      setUnreadCount(notifs.filter(n => !n.leido).length);
    });
    return () => unsubscribe();
  }, []);

  const handleBellClick = () => {
    setShowNotifPanel(!showNotifPanel);
    setUnreadCount(0);
    // Optionally, update Firestore to mark as read
  };

  const [floatingNotif, setFloatingNotif] = useState(null);

  useEffect(() => {
    // Listen for notifications in real time
    const q = query(collection(db, 'notificaciones'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotificaciones(notifs);

      // Show floating notification for the latest one if it's new
      if (notifs.length > 0) {
        const latest = notifs[0];
        // Only show if not created by this user (optional: add userId to notification)
        if (!floatingNotif || floatingNotif.id !== latest.id) {
          setFloatingNotif(latest);
          // Auto-close after 8 seconds
          setTimeout(() => setFloatingNotif(null), 8000);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="programarClase-container">
      {/* Bell Icon with notification count */}
      <div style={{ position: 'absolute', top: 20, right: 30, zIndex: 3000 }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            position: 'relative',
            cursor: 'pointer',
            fontSize: 28
          }}
          onClick={handleBellClick}
        >
          <BsBell />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -8,
              right: -8,
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 7px',
              fontSize: 14,
              fontWeight: 'bold'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
        {/* Floating notification panel */}
        {showNotifPanel && (
          <div style={{
            position: 'absolute',
            top: 40,
            right: 0,
            background: '#fff',
            border: '1px solid #007bff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: 16,
            zIndex: 4000,
            minWidth: 400
          }}>
            <h4 style={{ marginTop: 0 }}>Notificaciones</h4>
            {/* Make the notifications list scrollable */}
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                maxHeight: 400, // You can adjust this value as needed
                overflowY: 'auto'
              }}
            >
              {notificaciones.slice(0, 20).map(notif => {
                // Determine the join link
                let joinLink = '';
                if (notif.enlace) {
                  joinLink = notif.enlace;
                } else if (notif.plataforma === 'interna' && notif.roomName) {
                  joinLink = `https://meet.jit.si/${notif.roomName}`;
                }
                return (
                  <li
                    key={notif.id}
                    style={{
                      marginBottom: 12,
                      cursor: joinLink ? 'pointer' : 'default',
                      background: joinLink ? '#f5faff' : 'transparent',
                      borderRadius: 5,
                      padding: joinLink ? '6px' : '0'
                    }}
                    onClick={() => {
                      if (joinLink) {
                        window.location.href = joinLink;
                      }
                    }}
                  >
                    <div>{notif.mensaje}</div>
                    {joinLink && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          window.location.href = joinLink;
                        }}
                        style={{
                          marginTop: 4,
                          background: '#007bff',
                          color: '#fff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: 13
                        }}
                      >
                        Unirse
                      </button>
                    )}
                  </li>
                );
              })}
              {notificaciones.length === 0 && (
                <li>No hay notificaciones recientes.</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <main className="main-panel">
        {inMeeting && platform === 'interna' ? (
          <Videoconferencia roomName={roomName} displayName={displayName} />
        ) : (
          <div className="formulario">
            <h2>Video Conferencias</h2>
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
              <option value="webex">Webex Meetings</option>
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

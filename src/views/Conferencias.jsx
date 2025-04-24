import React, { useState, useEffect } from 'react';
import Videoconferencia from '../components/conferencias/Videoconferencia';
import { db } from '../database/firebaseconfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import '../styles/Conferencias.css';

const ProgramarClase = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inMeeting, setInMeeting] = useState(false);
  const [videollamadas, setVideollamadas] = useState([]);
  const [activePanel, setActivePanel] = useState('formulario');

  useEffect(() => {
    const q = query(collection(db, 'videoconferencias'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const llamadas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVideollamadas(llamadas);
    });
    return () => unsubscribe();
  }, []);

  const handleStartMeeting = async () => {
    if (!roomName || !displayName) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      await addDoc(collection(db, 'videoconferencias'), {
        roomName,
        displayName,
        fecha: serverTimestamp(),
      });
      setInMeeting(true);
    } catch (error) {
      console.error("Error al guardar la videollamada:", error);
    }
  };

  return (
    <div className="programarClase-container">
      <main className="main-panel">
        {inMeeting ? (
          <Videoconferencia roomName={roomName} displayName={displayName} />
        ) : activePanel === 'formulario' ? (
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
            <button onClick={handleStartMeeting}>Iniciar Videollamada</button>
          </div>
        ) : (
          <div className="historial">
            <h2>Historial de Videollamadas</h2>
            {videollamadas.length === 0 ? (
              <p>No hay llamadas registradas aún.</p>
            ) : (
              videollamadas.map((call) => (
                <div key={call.id} className="llamada-item">
                  <p><strong>Clase:</strong> {call.roomName}</p>
                  <p><strong>Docente:</strong> {call.displayName}</p>
                  <p className="fecha">{call.fecha?.toDate().toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <aside className="sidebar right">
        <button
          className={`sidebar-btn ${activePanel === 'formulario' ? 'active' : ''}`}
          onClick={() => setActivePanel('formulario')}
        >
          Conferencia
        </button>
        <button
          className={`sidebar-btn ${activePanel === 'historial' ? 'active' : ''}`}
          onClick={() => setActivePanel('historial')}
        >
          Historial
        </button>
      </aside>
    </div>
  );
};

export default ProgramarClase;

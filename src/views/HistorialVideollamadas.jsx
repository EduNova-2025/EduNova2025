import React, { useState, useEffect } from 'react';
import { db } from '../database/firebaseconfig';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import CuadroBusquedas from '../components/busquedas/CuadroBusquedas';
import '../styles/Conferencias.css';

const HistorialVideollamadas = () => {
  const [videollamadas, setVideollamadas] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'videoconferencias'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const llamadas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVideollamadas(llamadas);
    });
    return () => unsubscribe();
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const filteredCalls = videollamadas.filter((call) =>
    call.roomName.toLowerCase().includes(searchText) ||
    call.displayName.toLowerCase().includes(searchText) ||
    call.plataforma.toLowerCase().includes(searchText)
  );

  return (
    <div className="historial-videollamadas-container">
      <h2>Historial de Videollamadas</h2>
      <CuadroBusquedas searchText={searchText} handleSearchChange={handleSearchChange} />
      <div className="scrollable-historial">
        {filteredCalls.length === 0 ? (
          <p>No se encontraron videollamadas.</p>
        ) : (
          filteredCalls.map((call) => (
            <div key={call.id} className="llamada-item">
              <p><strong>Clase:</strong> {call.roomName}</p>
              <p><strong>Docente:</strong> {call.displayName}</p>
              <p><strong>Plataforma:</strong> {call.plataforma}</p>
              {call.enlace && (
                <p>
                  <a href={call.enlace} target="_blank" rel="noopener noreferrer">
                    Ir a llamada
                  </a>
                </p>
              )}
              <p className="fecha">{call.fecha?.toDate().toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorialVideollamadas;

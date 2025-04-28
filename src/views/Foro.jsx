import { useState, useEffect } from 'react';
import { db } from '../database/firebaseconfig';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import '../styles/Foro.css';

const gruposPredefinidos = [
  { id: 'matematicas', nombre: 'Matemáticas', icono: '🧮' },
  { id: 'lengua', nombre: 'Lengua y Literatura', icono: '📚' },
  { id: 'ciencias_naturales', nombre: 'Ciencias Naturales', icono: '🌿' },
  { id: 'estudios_sociales', nombre: 'Estudios Sociales', icono: '🌎' },
  { id: 'ingles', nombre: 'Inglés', icono: '🇬🇧' },
];

const Foro = () => {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuarioId, setUsuarioId] = useState('usuario1'); // Esto debería venir de la autenticación
  const [nombreUsuario, setNombreUsuario] = useState('Usuario'); // Esto debería venir de la autenticación

  useEffect(() => {
    if (grupoSeleccionado) {
      const q = query(collection(db, `grupos/${grupoSeleccionado.id}/mensajes`), orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const mensajesData = querySnapshot.docs.map(doc => doc.data());
        setMensajes(mensajesData);
      });
      return () => unsubscribe();
    }
  }, [grupoSeleccionado]);

  const enviarMensaje = async () => {
    if (nuevoMensaje.trim() !== '' && grupoSeleccionado) {
      await addDoc(collection(db, `grupos/${grupoSeleccionado.id}/mensajes`), {
        usuarioId,
        nombreUsuario,
        contenido: nuevoMensaje,
        timestamp: new Date()
      });
      setNuevoMensaje('');
    }
  };

  return (
    <div className="foro-container">
      <div className="chats-sidebar">
        <div className="chats-header">
          <h2>Grupos</h2>
        </div>
        <div className="chats-list">
          {gruposPredefinidos.map((grupo) => (
            <div
              key={grupo.id}
              className={`chat-item${grupoSeleccionado && grupoSeleccionado.id === grupo.id ? ' selected' : ''}`}
              onClick={() => setGrupoSeleccionado(grupo)}
            >
              <div className="chat-icon">{grupo.icono}</div>
              <div className="chat-name">{grupo.nombre}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <h2>{grupoSeleccionado ? grupoSeleccionado.nombre : 'Selecciona un grupo'}</h2>
        </div>
        <div className="chat-messages">
          {mensajes.map((mensaje, index) => (
            <div
              key={index}
              className={`message${mensaje.usuarioId === usuarioId ? ' mine' : ''}`}
            >
              <div className="message-content">
                <div className="message-author">{mensaje.nombreUsuario}</div>
                <div className="message-text">{mensaje.contenido}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
          <button className="send-button" onClick={enviarMensaje} aria-label="Enviar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Foro;

import { useState, useEffect } from 'react';
import { db } from '../database/firebaseconfig';
import { collection, addDoc, query, orderBy, onSnapshot, getDoc, doc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [usuarios, setUsuarios] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Obtener la información del usuario de Firestore
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          setUsuarioActual({
            ...user,
            ...userDoc.data()
          });
        } else {
          setUsuarioActual(user);
        }
      } else {
        setUsuarioActual(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (grupoSeleccionado && usuarioActual) {
      console.log('Grupo seleccionado:', grupoSeleccionado);
      console.log('Usuario actual:', usuarioActual);
      
      const mensajesRef = collection(db, `grupos/${grupoSeleccionado.id}/mensajes`);
      const q = query(mensajesRef, orderBy('timestamp'));

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        console.log('Nuevos mensajes recibidos:', querySnapshot.docs.length);
        const mensajesData = [];
        const usuariosTemp = { ...usuarios };

        for (const docSnapshot of querySnapshot.docs) {
          const mensaje = docSnapshot.data();
          console.log('Mensaje recibido:', mensaje);
          const mensajeId = docSnapshot.id;

          // Obtener información del usuario si no la tenemos
          if (!usuariosTemp[mensaje.usuarioId]) {
            const userDoc = await getDoc(doc(db, 'usuarios', mensaje.usuarioId));
            if (userDoc.exists()) {
              usuariosTemp[mensaje.usuarioId] = userDoc.data();
            }
          }

          mensajesData.push({
            id: mensajeId,
            ...mensaje,
            esMio: mensaje.usuarioId === usuarioActual.uid
          });
        }

        console.log('Mensajes procesados:', mensajesData);
        setUsuarios(usuariosTemp);
        setMensajes(mensajesData);
      });

      return () => unsubscribe();
    }
  }, [grupoSeleccionado, usuarioActual]);

  const enviarMensaje = async () => {
    if (nuevoMensaje.trim() !== '' && grupoSeleccionado && usuarioActual) {
      try {
        console.log('Intentando enviar mensaje...');
        const mensajesRef = collection(db, `grupos/${grupoSeleccionado.id}/mensajes`);
        const mensajeRef = await addDoc(mensajesRef, {
          usuarioId: usuarioActual.uid,
          contenido: nuevoMensaje,
          timestamp: Timestamp.now(),
          nombreUsuario: usuarioActual.username || 'Usuario'
        });
        
        console.log('Mensaje enviado con ID:', mensajeRef.id);
        setNuevoMensaje('');
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
      }
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
          {mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`message${mensaje.esMio ? ' mine' : ''}`}
            >
              <div className="message-content">
                <div className="message-author">
                  {usuarios[mensaje.usuarioId]?.username || 'Usuario'}
                </div>
                <div className="message-text">{mensaje.contenido}</div>
                <div className="message-time">
                  {mensaje.timestamp?.toDate ? 
                    new Date(mensaje.timestamp.toDate()).toLocaleTimeString() : 
                    new Date(mensaje.timestamp).toLocaleTimeString()}
                </div>
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
            onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
          />
          <button className="send-button" onClick={enviarMensaje} aria-label="Enviar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Foro;

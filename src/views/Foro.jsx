import { useState, useEffect, useRef } from 'react';
import { db } from '../database/firebaseconfig';
import {collection, addDoc, query, orderBy, onSnapshot, getDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import '../styles/Foro.css';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const gruposPredefinidos = [
  { id: 'matematicas', nombre: 'Matemáticas', icono: '🧮' },
  { id: 'lengua', nombre: 'Lengua y Literatura', icono: '📚' },
  { id: 'ciencias_naturales', nombre: 'Ciencias Naturales', icono: '🌿' },
  { id: 'estudios_sociales', nombre: 'Estudios Sociales', icono: '🌎' },
  { id: 'ingles', nombre: 'Inglés', icono: '🇬🇧' },
];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const Foro = () => {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [usuarios, setUsuarios] = useState({});
  const [noLeidos, setNoLeidos] = useState({});
  const [ultimosMensajes, setUltimosMensajes] = useState({});
  const isMobile = useIsMobile();
  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const storage = getStorage();
  const [visorImagen, setVisorImagen] = useState({ abierto: false, url: '', nombre: '' });
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  const marcarComoLeido = async (userId, grupoId) => {
    try {
      const userRef = doc(db, 'usuarios', userId);
      await updateDoc(userRef, {
        [`lecturas.${grupoId}`]: Timestamp.now()
      });
      setUsuarioActual((prev) => ({
        ...prev,
        lecturas: {
          ...(prev.lecturas || {}),
          [grupoId]: Timestamp.now()
        }
      }));
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
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
    if (usuarioActual) {
      const obtenerNoLeidos = async () => {
        const nuevosNoLeidos = {};
        for (const grupo of gruposPredefinidos) {
          const mensajesRef = collection(db, `grupos/${grupo.id}/mensajes`);
          const q = query(mensajesRef, orderBy('timestamp'));
          const snapshot = await onSnapshot(q, (querySnapshot) => {
            let count = 0;
            const lastRead = usuarioActual.lecturas?.[grupo.id]?.toDate ? usuarioActual.lecturas[grupo.id].toDate() : usuarioActual.lecturas?.[grupo.id];
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const msgTime = data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp;
              if (!lastRead || (msgTime && lastRead && msgTime > lastRead)) {
                if (data.usuarioId !== usuarioActual.uid) count++;
              }
            });
            nuevosNoLeidos[grupo.id] = count;
            setNoLeidos((prev) => ({ ...prev, [grupo.id]: count }));
          });
        }
      };
      obtenerNoLeidos();
    }
  }, [usuarioActual, mensajes.length]);

  useEffect(() => {
    if (usuarioActual) {
      const obtenerUltimosMensajes = async () => {
        for (const grupo of gruposPredefinidos) {
          const mensajesRef = collection(db, `grupos/${grupo.id}/mensajes`);
          const q = query(mensajesRef, orderBy('timestamp', 'desc'));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
              const docSnap = querySnapshot.docs[0];
              const data = docSnap.data();
              setUltimosMensajes((prev) => ({
                ...prev,
                [grupo.id]: {
                  usuario: data.nombreUsuario || 'Usuario',
                  hora: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
                  contenido: data.contenido || ''
                }
              }));
            } else {
              setUltimosMensajes((prev) => ({ ...prev, [grupo.id]: null }));
            }
          });
        }
      };
      obtenerUltimosMensajes();
    }
  }, [usuarioActual]);

  const handleSeleccionarGrupo = async (grupo) => {
    setGrupoSeleccionado(grupo);
    if (usuarioActual) {
      await marcarComoLeido(usuarioActual.uid, grupo.id);
      setNoLeidos((prev) => ({ ...prev, [grupo.id]: 0 }));
    }
  };

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !grupoSeleccionado || !usuarioActual) return;
    setSubiendoArchivo(true);
    try {
      // Subir archivo a Storage
      const storageRef = ref(storage, `chats/${grupoSeleccionado.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      // Enviar mensaje con archivo
      const mensajesRef = collection(db, `grupos/${grupoSeleccionado.id}/mensajes`);
      await addDoc(mensajesRef, {
        usuarioId: usuarioActual.uid,
        contenido: '',
        archivoUrl: url,
        archivoNombre: file.name,
        archivoTipo: file.type,
        timestamp: Timestamp.now(),
        nombreUsuario: usuarioActual.username || 'Usuario'
      });
    } catch (error) {
      console.error('Error al subir archivo:', error);
    }
    setSubiendoArchivo(false);
  };

  // Botón para volver a la lista en móvil
  const handleBackToList = () => setGrupoSeleccionado(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [mensajes, grupoSeleccionado]);

  // Renderizado condicional según dispositivo
  if (isMobile) {
    return (
      <div className="foro-container" style={{ flexDirection: 'column', height: '100vh' }}>
        {!grupoSeleccionado ? (
          <div className="chats-sidebar" style={{ width: '100%', borderRadius: 0, height: '100vh', overflowY: 'auto' }}>
            <div className="chats-header">
              <button
                className="menu-button"
                aria-label="Abrir menú"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 26,
                  color: '#1a73e8',
                  cursor: 'pointer',
                  marginRight: 12,
                  marginLeft: 0,
                  marginTop: 44,
                  display: isMobile ? 'block' : 'none',
                  height: 40,
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <span style={{fontSize: 28}}>☰</span>
              </button>
              <h2 style={{ margin: 0, flex: 1, textAlign: 'left' }}>EduNova</h2>
            </div>
            <div className="chats-list">
              {gruposPredefinidos.map((grupo) => {
                const ultimo = ultimosMensajes[grupo.id];
                return (
                  <div
                    key={grupo.id}
                    className={`chat-item${grupoSeleccionado && grupoSeleccionado.id === grupo.id ? ' selected' : ''}`}
                    onClick={() => handleSeleccionarGrupo(grupo)}
                  >
                    <div className="chat-icon">{grupo.icono}</div>
                    <div className="chat-info">
                      <div className="chat-name">
                        <span>{grupo.nombre}</span>
                        {ultimo && (
                          <span className="chat-time">
                            {ultimo.hora ? new Date(ultimo.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        )}
                      </div>
                      {ultimo && (
                        <div className="chat-message">
                          <span>{ultimo.usuario}:</span> {ultimo.contenido}
                        </div>
                      )}
                    </div>
                    {noLeidos[grupo.id] > 0 && (
                      <span className="chat-notifications">{noLeidos[grupo.id]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="chat-main" style={{ width: '100%', borderRadius: 0, minWidth: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="chat-header" style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={handleBackToList} style={{ marginRight: 16, background: 'none', border: 'none', fontSize: 22, color: '#1a73e8', cursor: 'pointer' }} aria-label="Volver">
                ←
              </button>
              <h2 style={{ margin: 0 }}>{grupoSeleccionado.nombre}</h2>
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
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
                    {mensaje.archivoUrl && (
                      mensaje.archivoTipo && mensaje.archivoTipo.startsWith('image/') ? (
                        <img
                          src={mensaje.archivoUrl}
                          alt={mensaje.archivoNombre}
                          style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '8px', cursor: 'pointer' }}
                          onClick={() => setVisorImagen({ abierto: true, url: mensaje.archivoUrl, nombre: mensaje.archivoNombre })}
                        />
                      ) : (
                        <a href={mensaje.archivoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', marginTop: '8px', display: 'block' }}>
                          📄 {mensaje.archivoNombre}
                        </a>
                      )
                    )}
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
              {subiendoArchivo && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#1a73e8',
                  fontWeight: 500,
                  marginBottom: 8
                }}>
                  <span className="spinner" style={{
                    width: 20, height: 20, border: '3px solid #1a73e8', borderTop: '3px solid #fff',
                    borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite'
                  }}></span>
                  Subiendo archivo...
                </div>
              )}
              <button
                className="attach-button"
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                aria-label="Adjuntar archivo"
                style={{ background: 'none', border: 'none', fontSize: 22, marginRight: 8, cursor: 'pointer' }}
              >
                📎
              </button>
              <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
                onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                style={{ flex: 1 }}
              />
              <button className="send-button" onClick={enviarMensaje} aria-label="Enviar">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  console.log("isMobile:", isMobile);

  return (
    <div className="foro-container">
      <div className="chats-sidebar">
        <div className="chats-header">
          <h2>EduNova</h2>
        </div>
        <div className="chats-list">
          {gruposPredefinidos.map((grupo) => {
            const ultimo = ultimosMensajes[grupo.id];
            return (
              <div
                key={grupo.id}
                className={`chat-item${grupoSeleccionado && grupoSeleccionado.id === grupo.id ? ' selected' : ''}`}
                onClick={() => handleSeleccionarGrupo(grupo)}
              >
                <div className="chat-icon">{grupo.icono}</div>
                <div className="chat-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="chat-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{grupo.nombre}</span>
                    {ultimo && (
                      <span className="chat-time" style={{ marginLeft: 8, fontSize: '0.85em', color: '#888', minWidth: 60, textAlign: 'right' }}>
                        {ultimo.hora ? new Date(ultimo.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    )}
                  </div>
                  {ultimo && (
                    <div className="chat-message" style={{ fontSize: '0.92em', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontWeight: 500 }}>{ultimo.usuario}:</span> {ultimo.contenido}
                    </div>
                  )}
                </div>
                {noLeidos[grupo.id] > 0 && (
                  <span className="chat-notifications">{noLeidos[grupo.id]}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Solo mostrar el área del chat si hay grupo seleccionado */}
      {grupoSeleccionado ? (
        <div className="chat-main" style={{ width: '100%', borderRadius: 0, minWidth: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div className="chat-header" style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={handleBackToList} style={{ marginRight: 16, background: 'none', border: 'none', fontSize: 22, color: '#1a73e8', cursor: 'pointer' }} aria-label="Volver">
              ←
            </button>
            <h2 style={{ margin: 0 }}>{grupoSeleccionado.nombre}</h2>
          </div>
          <div className="chat-messages" ref={chatMessagesRef}>
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
                  {mensaje.archivoUrl && (
                    mensaje.archivoTipo && mensaje.archivoTipo.startsWith('image/') ? (
                      <img
                        src={mensaje.archivoUrl}
                        alt={mensaje.archivoNombre}
                        style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '8px', cursor: 'pointer' }}
                        onClick={() => setVisorImagen({ abierto: true, url: mensaje.archivoUrl, nombre: mensaje.archivoNombre })}
                      />
                    ) : (
                      <a href={mensaje.archivoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', marginTop: '8px', display: 'block' }}>
                        📄 {mensaje.archivoNombre}
                      </a>
                    )
                  )}
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
            {subiendoArchivo && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#1a73e8',
                fontWeight: 500,
                marginBottom: 8
              }}>
                <span className="spinner" style={{
                  width: 20, height: 20, border: '3px solid #1a73e8', borderTop: '3px solid #fff',
                  borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite'
                }}></span>
                Subiendo archivo...
              </div>
            )}
            <button
              className="attach-button"
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              aria-label="Adjuntar archivo"
              style={{ background: 'none', border: 'none', fontSize: 22, marginRight: 8, cursor: 'pointer' }}
            >
              📎
            </button>
            <input
              type="file"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
              style={{ flex: 1 }}
            />
            <button className="send-button" onClick={enviarMensaje} aria-label="Enviar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        !isMobile && (
          <div className="chat-placeholder">
            <div className="placeholder-content">
              <h1>Selecciona un grupo</h1>
              <p>para comenzar a chatear</p>
            </div>
          </div>
        )
      )}
      {visorImagen.abierto && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setVisorImagen({ abierto: false, url: '', nombre: '' })}
        >
          <img
            src={visorImagen.url}
            alt={visorImagen.nombre}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '12px',
              boxShadow: '0 4px 32px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setVisorImagen({ abierto: false, url: '', nombre: '' })}
            style={{
              position: 'fixed',
              top: 24,
              right: 32,
              fontSize: 32,
              color: '#fff',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10000
            }}
            aria-label='Cerrar visor'
          >✕</button>
        </div>
      )}
    </div>
  );
};

export default Foro;
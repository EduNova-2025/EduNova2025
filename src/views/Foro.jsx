import { useState, useEffect, useRef } from 'react';
import { db } from '../database/firebaseconfig';
import {collection, addDoc, query, orderBy, onSnapshot, getDoc, doc, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import '../styles/Foro.css';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../database/authcontext";

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

const Foro = ({ grupoSeleccionado, setGrupoSeleccionado }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
  const [grabandoAudio, setGrabandoAudio] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioSubiendo, setAudioSubiendo] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [mensajeAEliminar, setMensajeAEliminar] = useState(null);
  const [temas, setTemas] = useState([]);
  const [nuevoTema, setNuevoTema] = useState({
    titulo: "",
    contenido: "",
    autor: user?.email || "",
    fecha: new Date().toISOString(),
    respuestas: [],
    estado: "activo"
  });
  const [error, setError] = useState(null);

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
          nombreUsuario: usuarioActual.nombre || 'Usuario'
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
        nombreUsuario: usuarioActual.nombre || 'Usuario'
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

  // Función para iniciar la grabación de audio
  const iniciarGrabacion = async () => {
    if (!grupoSeleccionado || !usuarioActual) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setAudioChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = async () => {
        if (audioChunks.length === 0) return;
        setAudioSubiendo(true);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFileName = `audio_${Date.now()}.webm`;
        const storageRef = ref(storage, `chats/${grupoSeleccionado.id}/${audioFileName}`);
        await uploadBytes(storageRef, audioBlob);
        const url = await getDownloadURL(storageRef);
        const mensajesRef = collection(db, `grupos/${grupoSeleccionado.id}/mensajes`);
        await addDoc(mensajesRef, {
          usuarioId: usuarioActual.uid,
          contenido: '',
          archivoUrl: url,
          archivoNombre: audioFileName,
          archivoTipo: 'audio/webm',
          timestamp: Timestamp.now(),
          nombreUsuario: usuarioActual.nombre || 'Usuario'
        });
        setAudioSubiendo(false);
        setAudioChunks([]);
      };
      recorder.start();
      setGrabandoAudio(true);
    } catch (err) {
      alert('No se pudo acceder al micrófono.');
    }
  };

  // Función para detener la grabación de audio
  const detenerGrabacion = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setGrabandoAudio(false);
    }
  };

  // Eliminar mensaje (solo Mined y Admin)
  const solicitarEliminarMensaje = (mensajeId) => {
    if (!usuarioActual || (usuarioActual.rol !== 'Mined' && usuarioActual.rol !== 'Admin')) {
      setShowModalEliminar(true);
      setMensajeAEliminar(null); // No hay mensaje a eliminar, solo mostrar advertencia
      return;
    }
    setMensajeAEliminar(mensajeId);
    setShowModalEliminar(true);
  };

  const eliminarMensaje = async () => {
    if (!grupoSeleccionado || !mensajeAEliminar) return;
    try {
      await deleteDoc(doc(db, `grupos/${grupoSeleccionado.id}/mensajes`, mensajeAEliminar));
      setShowModalEliminar(false);
      setMensajeAEliminar(null);
    } catch (err) {
      setShowModalEliminar(false);
      setMensajeAEliminar(null);
      // Podrías mostrar un error aquí si lo deseas
    }
  };

  // --- MODAL DE ELIMINACIÓN GLOBAL ---
  const modalEliminar = (
    <Modal show={showModalEliminar} onHide={() => { setShowModalEliminar(false); setMensajeAEliminar(null); }} centered>
      <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensajeAEliminar ? (
          <>
            <p>{t('foro.confirmarEliminacion')}</p>
            <p className="text-danger">{t('foro.accionNoSePuedeDeshacer')}</p>
          </>
        ) : (
          <p className="text-danger">{t('foro.noTienesPermisosEliminar')}</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { setShowModalEliminar(false); setMensajeAEliminar(null); }}>
          {t('foro.cancelar')}
        </Button>
        {mensajeAEliminar && (
          <Button variant="danger" onClick={eliminarMensaje}>
            {t('foro.eliminar')}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const temasSnapshot = await getDocs(collection(db, "temas"));
        const temasData = temasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTemas(temasData);
      } catch (error) {
        console.error("Error al obtener temas:", error);
        setError(t('foro.errorObtener'));
      }
    };

    fetchTemas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoTema(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoTema.titulo || !nuevoTema.contenido) {
      setError(t('foro.camposRequeridos'));
      return;
    }

    try {
      await addDoc(collection(db, "temas"), nuevoTema);
      setNuevoTema({
        titulo: "",
        contenido: "",
        autor: user?.email || "",
        fecha: new Date().toISOString(),
        respuestas: [],
        estado: "activo"
      });
      setError(null);
    } catch (error) {
      console.error("Error al agregar tema:", error);
      setError(t('foro.errorAgregar'));
    }
  };

  const handleEliminarTema = async (temaId) => {
    if (window.confirm(t('foro.confirmarEliminacion'))) {
      try {
        await deleteDoc(doc(db, "temas", temaId));
        setTemas(temas.filter(tema => tema.id !== temaId));
      } catch (error) {
        console.error("Error al eliminar tema:", error);
        setError(t('foro.errorEliminar'));
      }
    }
  };

  // Renderizado condicional según dispositivo
  if (isMobile) {
    return (
      <>
        <div className="foro-container" style={{ flexDirection: 'column', height: '100vh' }}>
          {!grupoSeleccionado ? (
            <div className="chats-sidebar">
              <div className="chats-header">
                <button
                  className="menu-button"
                  aria-label="Abrir menú"
                  style={{
                    position: grupoSeleccionado ? 'fixed' : 'static',
                    top: grupoSeleccionado ? 20 : undefined,
                    left: grupoSeleccionado ? 20 : undefined,
                    zIndex: grupoSeleccionado ? 2000 : undefined,
                    background: 'white',
                    color: '#1a73e8',
                    cursor: 'pointer',
                    marginRight: grupoSeleccionado ? 0 : 12,
                    marginLeft: grupoSeleccionado ? 0 : 0,
                    marginTop: grupoSeleccionado ? 0 : 44,
                    height: 40,
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    boxShadow: grupoSeleccionado ? '0 2px 8px rgba(0,0,0,0.08)' : undefined
                  }}
                >
                
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
                        {usuarios[mensaje.usuarioId]?.nombre || 'Usuario'}
                        {/* Botón eliminar solo para Mined y Admin */}
                        {usuarioActual && (usuarioActual.rol === 'Mined' || usuarioActual.rol === 'Admin') && (
                          <button
                            onClick={() => solicitarEliminarMensaje(mensaje.id)}
                            style={{ marginLeft: 8, color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                            title="Eliminar mensaje"
                          >🗑️</button>
                        )}
                      </div>
                      <div className="message-text">{mensaje.contenido}</div>
                      {/* Mostrar audio si el mensaje es de audio */}
                      {mensaje.archivoUrl && mensaje.archivoTipo && mensaje.archivoTipo.startsWith('audio/') && (
                        <audio controls src={mensaje.archivoUrl} style={{ marginTop: 8, width: '100%' }} />
                      )}
                      {mensaje.archivoUrl && mensaje.archivoTipo && mensaje.archivoTipo.startsWith('image/') && (
                        <img
                          src={mensaje.archivoUrl}
                          alt={mensaje.archivoNombre}
                          style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '8px', cursor: 'pointer' }}
                          onClick={() => setVisorImagen({ abierto: true, url: mensaje.archivoUrl, nombre: mensaje.archivoNombre })}
                        />
                      )}
                      {mensaje.archivoUrl && mensaje.archivoTipo && !mensaje.archivoTipo.startsWith('image/') && !mensaje.archivoTipo.startsWith('audio/') && (
                        <a href={mensaje.archivoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', marginTop: '8px', display: 'block' }}>
                          📄 {mensaje.archivoNombre}
                        </a>
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
                    {t('foro.subiendoArchivo')}
                  </div>
                )}
                <button
                  className="attach-button"
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  aria-label={t('foro.adjuntarArchivo')}
                  style={{ background: 'none', border: 'none', fontSize: 22, marginRight: 8, cursor: 'pointer' }}
                >
                  📎
                </button>
                <button
                  className="audio-button"
                  type="button"
                  onClick={grabandoAudio ? detenerGrabacion : iniciarGrabacion}
                  aria-label={grabandoAudio ? t('foro.detenerGrabacion') : t('foro.grabarAudio')}
                  style={{ background: grabandoAudio ? '#e57373' : 'none', border: 'none', fontSize: 22, marginRight: 8, cursor: 'pointer' }}
                >
                  {grabandoAudio ? '⏹️' : '🎤'}
                </button>
                {audioSubiendo && (
                  <span style={{ color: '#1a73e8', fontWeight: 500, marginRight: 8 }}>{t('foro.subiendoAudio')}</span>
                )}
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
                  placeholder={t('foro.escribeMensaje')}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                  style={{ flex: 1 }}
                />
                <button className="send-button" onClick={enviarMensaje} aria-label={t('foro.enviar')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        {modalEliminar}
      </>
    );
  }

  console.log("isMobile:", isMobile);

  return (
    <>
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
                      {usuarios[mensaje.usuarioId]?.nombre || 'Usuario'}
                      {/* Botón eliminar solo para Mined y Admin */}
                      {usuarioActual && (usuarioActual.rol === 'Mined' || usuarioActual.rol === 'Admin') && (
                        <button
                          onClick={() => solicitarEliminarMensaje(mensaje.id)}
                          style={{ marginLeft: 8, color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                          title={t('foro.eliminarMensaje')}
                        >🗑️</button>
                      )}
                    </div>
                    <div className="message-text">{mensaje.contenido}</div>
                    {/* Mostrar audio si el mensaje es de audio */}
                    {mensaje.archivoUrl && mensaje.archivoTipo && mensaje.archivoTipo.startsWith('audio/') && (
                      <audio controls src={mensaje.archivoUrl} style={{ marginTop: 8, width: '100%' }} />
                    )}
                    {mensaje.archivoUrl && mensaje.archivoTipo && mensaje.archivoTipo.startsWith('image/') && (
                      <img
                        src={mensaje.archivoUrl}
                        alt={mensaje.archivoNombre}
                        style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '8px', cursor: 'pointer' }}
                        onClick={() => setVisorImagen({ abierto: true, url: mensaje.archivoUrl, nombre: mensaje.archivoNombre })}
                      />
                    )}
                    {mensaje.archivoUrl && mensaje.archivoTipo && !mensaje.archivoTipo.startsWith('image/') && !mensaje.archivoTipo.startsWith('audio/') && (
                      <a href={mensaje.archivoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', marginTop: '8px', display: 'block' }}>
                        📄 {mensaje.archivoNombre}
                      </a>
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
                  {t('foro.subiendoArchivo')}
                </div>
              )}
              <button
                className="attach-button"
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                aria-label={t('foro.adjuntarArchivo')}
                style={{ background: 'none', border: 'none', fontSize: 22, marginRight: 8, cursor: 'pointer' }}
              >
                📎
              </button>
              <button
                className="audio-button"
                type="button"
                onClick={grabandoAudio ? detenerGrabacion : iniciarGrabacion}
                aria-label={grabandoAudio ? t('foro.detenerGrabacion') : t('foro.grabarAudio')}
                style={{ background: grabandoAudio ? '#e57373' : 'none', border: 'none', fontSize: 22, marginRight: 8, cursor: 'pointer' }}
              >
                {grabandoAudio ? '⏹️' : '🎤'}
              </button>
              {audioSubiendo && (
                <span style={{ color: '#1a73e8', fontWeight: 500, marginRight: 8 }}>{t('foro.subiendoAudio')}</span>
              )}
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
                placeholder={t('foro.escribeMensaje')}
                onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                style={{ flex: 1 }}
              />
              <button className="send-button" onClick={enviarMensaje} aria-label={t('foro.enviar')}>
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
                <h1>{t('foro.seleccionaGrupo')}</h1>
                <p>{t('foro.paraComenzarChat')}</p>
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
              aria-label={t('foro.cerrarVisor')}
            >✕</button>
          </div>
        )}
      </div>
      {modalEliminar}
    </>
  );
};

export default Foro;
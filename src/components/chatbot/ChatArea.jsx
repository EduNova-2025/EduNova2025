import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { BsList, BsPlus, BsChatDots } from 'react-icons/bs';
import Chatbot from './Chatbot';
import { getAnswerFromFirebase, resetChat, processUploadedPdf, loadSessionMessages, clearSession } from '../chatbot/serviciosIA/firebaseService';
import { db, auth } from '../../database/firebaseconfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './InputBox.css';

const ChatArea = () => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const fileInputRef = useRef(null);

  // Monitorear el estado de autenticación y cargar mensajes
  useEffect(() => {
    let unsubscribeMessages = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribeMessages = loadSessionMessages((messages) => {
          setResponses(messages.map(msg => ({
            user: msg.question,
            ai: msg.answer,
          })));
        });
      } else {
        setResponses([]);
        clearSession();
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeAuth();
    };
  }, []);

  // Escucha en tiempo real el historial de sesiones
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'chatSessions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs
        .filter(doc => doc.data().userId === user.uid)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      setChatHistory(history);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) {
      console.log('No se puede enviar un mensaje vacío.');
      return;
    }

    const response = await getAnswerFromFirebase(message);
    if (response !== 'No se pudo enviar el mensaje.') {
      setResponses([...responses, { user: message, ai: response }]);
      setMessage('');
      setAttachedFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && message.trim()) {
      handleSend();
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
      const success = await processUploadedPdf(file);
      if (success) {
        console.log('PDF procesado exitosamente.');
      } else {
        console.log('Error al procesar el PDF.');
      }
    }
  };

  const handleNewChat = async () => {
    await resetChat();
    setResponses([]);
    setAttachedFile(null);
    setMessage(''); // Limpiar el input
    console.log('Nuevo chat iniciado');
  };

  const handleSignOut = async () => {
    await signOut(auth);
    console.log('Sesión cerrada');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="d-flex">
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>EduNova AI</h4>
          <Button variant="danger" onClick={handleSignOut}>
            Cerrar Sesión
          </Button>
        </div>
        <div className="chat-history">
          <h5>Historial de Sesiones</h5>
          <ul className="chat-list">
            {chatHistory.map(session => (
              <li key={session.id} className="chat-item">
                <BsChatDots className="chat-icon" />
                <span>
                  {session.title || 'Sin título'} -{' '}
                  {session.timestamp?.toDate().toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <div className="chat-area justify-content-center text-center flex-grow-1 p-5">
        <div className="top-right-buttons">
          <button
            className="new-chat-btn"
            type="button"
            onClick={handleNewChat}
            title="Nuevo Chat"
          >
            <BsPlus size={20} />
          </button>
          <Button
            variant="light"
            className="icon-btn menu-btn"
            onClick={toggleSidebar}
            title="Abrir menú de historial"
          >
            <BsList size={20} />
          </Button>
        </div>

        {responses.length === 0 && (
          <>
            <div className="masteria-title">Master IA</div>
            <h1 className="plan-title text-primary fw-bold">¿Listo para planificar?</h1>
          </>
        )}

        <Chatbot responses={responses} />

        {attachedFile && (
          <div className="attached-file-preview">
            <span className="attached-file-name">{attachedFile.name}</span>
            <button
              className="discard-file-btn"
              type="button"
              title="Descartar archivo"
              onClick={() => {
                setAttachedFile(null);
              }}
            >
              ✖
            </button>
          </div>
        )}

        <div className="input-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            className="input-box"
            value={message}
            placeholder="Escribe tu pregunta..."
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf"
            onChange={handleFileChange}
          />
          <button
            className="icon-btn attach-btn"
            type="button"
            onClick={handleAttachClick}
            title="Adjuntar archivo"
          >
            <span role="img" aria-label="Adjuntar">📎</span>
          </button>
          <button
            className="icon-btn send-btn"
            type="button"
            onClick={handleSend}
            title="Enviar"
          >
            <span role="img" aria-label="Enviar">📤</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
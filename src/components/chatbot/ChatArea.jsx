import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { BsList, BsPlus, BsChatDots } from 'react-icons/bs';
import Chatbot from './Chatbot';
import { getAnswerFromFirebase, resetChat, processUploadedPdf } from '../chatbot/serviciosIA/firebaseService';
import { db } from '../../database/firebaseconfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './InputBox.css';

const ChatArea = () => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const fileInputRef = useRef(null);

  // Verificar conexión inicial con la IA
  useEffect(() => {
    const checkConnection = async () => {
      const testResponse = await getAnswerFromFirebase("Test connection");
      console.log("Estado de la conexión con la IA:", testResponse);
    };
    checkConnection();
  }, []);

  // Escucha en tiempo real el historial de chats
  useEffect(() => {
    const q = query(collection(db, 'chatHistory'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatHistory(history);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    const response = await getAnswerFromFirebase(message);
    setResponses([...responses, { user: message, ai: response }]);
    setMessage('');
    setAttachedFile(null); // Limpiar archivo después de enviar (opcional)
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

  const handleNewChat = () => {
    resetChat();
    setResponses([]);
    setAttachedFile(null);
    console.log('Nuevo chat iniciado');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="d-flex">
      {/* Barra lateral */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>EduNova AI</h4>
        </div>
        <div className="chat-history">
          <h5>Historial de Chats</h5>
          <ul className="chat-list">
            {chatHistory.map(chat => (
              <li key={chat.id} className="chat-item">
                <BsChatDots className="chat-icon" />
                <span>{chat.question}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Overlay para cerrar la barra lateral en dispositivos móviles */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Área de chat */}
      <div className="chat-area justify-content-center text-center flex-grow-1 p-5">
        {/* Botones en la esquina superior derecha */}
        <div className="top-right-buttons">
          <button
            className="new-chat-btn"
            type="button"
            onClick={handleNewChat}
            title="Nuevo Chat"
          >
            <span role="img" aria-label="Nuevo Chat">+</span>
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
                // Limpiar el texto del PDF si se descarta
                // Nota: `uploadedPdfText` no está definido en el código original, así que asegúrate de manejarlo si es necesario
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
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
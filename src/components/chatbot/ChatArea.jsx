import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { BsList, BsPlus, BsX, BsTrash, BsPencil } from 'react-icons/bs';
import Chatbot from './Chatbot';
import { getAnswerFromFirebase, resetChat, processUploadedPdf, loadSessionMessages, clearSession, deleteSession, updateSessionTitle } from '../chatbot/serviciosIA/firebaseService';
import { db, auth } from '../../database/firebaseconfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './InputBox.css';

const ChatArea = () => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let unsubscribeMessages = () => {};
  
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Espera a que la promesa se resuelva y guarda el unsubscribe real
        loadSessionMessages((messages) => {
          setResponses(messages.map(msg => ({
            user: msg.question,
            ai: msg.answer,
          })));
        }).then(unsub => {
          unsubscribeMessages = unsub || (() => {});
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

  const handleChatSelect = async (session) => {
    setCurrentSessionId(session.id);
    const messagesCollection = collection(db, `chatSessions/${session.id}/messages`);
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        user: doc.data().question,
        ai: doc.data().answer,
      }));
      setResponses(messages);
      setIsModalOpen(false);
    });

    return () => unsubscribe();
  };

  const clearInputFields = () => {
    setMessage('');
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      console.log('No se puede enviar un mensaje vacío.');
      return;
    }

    const currentMessage = message;
    clearInputFields();

    // Mostrar mensaje del usuario inmediatamente
    setResponses(prev => [...prev, { user: currentMessage, ai: null }]);
    setIsAIProcessing(true);

    try {
      const response = await getAnswerFromFirebase(currentMessage);
      if (response !== 'No se pudo enviar el mensaje.') {
        // Actualizar con la respuesta de la IA
        setResponses(prev => {
          const updatedResponses = [...prev];
          updatedResponses[updatedResponses.length - 1] = { user: currentMessage, ai: response };
          return updatedResponses;
        });
      } else {
        console.log('Error al enviar el mensaje desde Firebase');
      }
    } catch (error) {
      console.error('Error en handleSend:', error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!message.trim()) {
        console.log('No se puede enviar un mensaje vacío.');
        return;
      }

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

  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [responses, isAIProcessing]);

  const handleNewChat = async () => {
    await resetChat();
    setResponses([]);
    clearInputFields();
    setCurrentSessionId(null);
    console.log('Nuevo chat iniciado');
  };

  const handleSignOut = async () => {
    await signOut(auth);
    console.log('Sesión cerrada');
    setIsModalOpen(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDeleteSession = async (sessionId) => {
    const user = auth.currentUser;
    if (user && await deleteSession(sessionId, user.uid)) {
      setChatHistory(chatHistory.filter(session => session.id !== sessionId));
      if (currentSessionId === sessionId) {
        setResponses([]);
        setCurrentSessionId(null);
      }
    }
  };

  const handleEditTitle = (sessionId, currentTitle) => {
    setEditingSessionId(sessionId);
    setNewTitle(currentTitle || 'Sin título');
  };

  const handleSaveTitle = async () => {
    const user = auth.currentUser;
    if (user && editingSessionId && await updateSessionTitle(editingSessionId, newTitle, user.uid)) {
      setChatHistory(chatHistory.map(session =>
        session.id === editingSessionId ? { ...session, title: newTitle } : session
      ));
      setEditingSessionId(null);
      setNewTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setNewTitle('');
  };

  return (
    <div className="d-flex" style={{ height: '100%', overflow: 'hidden' }}>
      <div className={`history-modal ${isModalOpen ? 'open' : ''}`}>
        <div className="history-modal-header">
          <h4>EduNova AI</h4>
          <button className="history-modal-close" onClick={toggleModal}>
            <BsX size={24} />
          </button>
        </div>
        <div className="history-modal-body">
          <h5>Historial</h5>
          <ul className="chat-list">
            {chatHistory.map(session => (
              <li key={session.id} className="chat-item" onClick={() => handleChatSelect(session)}>
                <div className="chat-item-content">
                  {editingSessionId === session.id ? (
                    <div className="edit-title-container">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                        className="title-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button onClick={(e) => { e.stopPropagation(); handleSaveTitle(); }} className="action-btn save-btn">✓</button>
                      <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} className="action-btn cancel-btn">✗</button>
                    </div>
                  ) : (
                    <>
                      <span className="chat-item-title">
                        {session.title || 'Sin título'}
                      </span>
                      <span className="chat-item-date">
                        {session.timestamp?.toDate().toLocaleString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) || 'Fecha no disponible'}
                      </span>
                      <div className="action-buttons">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditTitle(session.id, session.title); }}
                          className="action-btn edit-btn"
                          title="Renombrar"
                        >
                          <BsPencil size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                          className="action-btn delete-btn"
                          title="Eliminar"
                        >
                          <BsTrash size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="history-modal-footer">
          <Button variant="danger" onClick={handleSignOut}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {isModalOpen && <div className="history-modal-overlay" onClick={toggleModal}></div>}

      <div className="chat-area justify-content-center text-center flex-grow-1 p-5" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            onClick={toggleModal}
            title="Abrir historial"
          >
            <BsList size={20} />
          </Button>
        </div>

        {responses.length === 0 && !isAIProcessing && (
          <>
            <div className="masteria-title">Master IA</div>
            <h1 className="plan-title text-primary fw-bold">¿Listo para planificar?</h1>
          </>
        )}

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Chatbot responses={responses} isAIProcessing={isAIProcessing} />
        </div>

        {attachedFile && (
          <div className="attached-file-preview">
            <span className="attached-file-name">{attachedFile.name}</span>
            <button
              className="discard-file-btn"
              type="button"
              title="Descartar archivo"
              onClick={() => {
                setAttachedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              ✖
            </button>
          </div>
        )}

        <div className="input-container">
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
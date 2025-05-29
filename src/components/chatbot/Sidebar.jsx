import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { BsList, BsChatDots, BsTrash } from 'react-icons/bs';
import './InputBox.css';
import { db, auth } from '../../database/firebaseconfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { deleteSession } from './serviciosIA/firebaseService';

const Sidebar = ({ onChatSelect, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen && onClose) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    console.log('Sesión cerrada');
  };

  const handleChatSelect = (session) => {
    if (onChatSelect) {
      onChatSelect(session);
    }
    setIsOpen(false);
  };

  const handleDeleteClick = (session) => {
    setSessionToDelete(session);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (sessionToDelete) {
      const success = await deleteSession(sessionToDelete.id);
      if (success) {
        setChatHistory(chatHistory.filter(chat => chat.id !== sessionToDelete.id));
      }
    }
    setShowConfirmDialog(false);
    setSessionToDelete(null);
  };

  return (
    <>
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
              <li 
                key={session.id} 
                className="chat-item"
                onClick={() => handleChatSelect(session)}
                style={{ cursor: 'pointer' }}
              >
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
                <button
                  className="delete-btn"
                  style={{ background: 'red', color: 'white', border: '2px solid black', zIndex: 9999 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(session);
                  }}
                  title="Eliminar chat"
                >
                  ELIMINAR <BsTrash style={{ color: 'white', fontSize: '1.5rem' }} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {showConfirmDialog && (
        <div className="confirm-dialog">
          <p>¿Estás seguro de que deseas eliminar este chat?</p>
          <Button variant="danger" onClick={handleConfirmDelete}>Eliminar</Button>
          <Button variant="secondary" onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
        </div>
      )}
    </>
  );
};

export default Sidebar;
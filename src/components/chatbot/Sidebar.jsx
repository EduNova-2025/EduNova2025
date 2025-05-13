import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { BsList, BsPlus, BsChatDots } from 'react-icons/bs';
import './InputBox.css';
import { db } from '../../database/firebaseconfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // Escucha en tiempo real el historial de chats
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNewChat = () => {
    console.log('Nuevo chat iniciado');
    // Aquí puedes agregar la lógica para iniciar un nuevo chat
  };

  return (
    <>
      {/* Botones en la esquina superior derecha */}
      <div className="top-right-buttons">
        <Button
          variant="light"
          className="icon-btn new-chat-btn"
          onClick={handleNewChat}
          title="Iniciar nuevo chat"
        >
          <BsPlus size={20} />
        </Button>
        <Button
          variant="light"
          className="icon-btn menu-btn"
          onClick={toggleSidebar}
          title="Abrir menú de historial"
        >
          <BsList size={20} />
        </Button>
      </div>

      {/* Barra lateral */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>EduNova AI</h4>
        </div>

        {/* Contenido de la barra lateral (historial de chats) */}
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
    </>
  );
};

export default Sidebar;

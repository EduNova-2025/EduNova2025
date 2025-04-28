import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { BsList, BsPlus, BsChatDots } from 'react-icons/bs'; // Importamos los íconos de React Icons
import './InputBox.css'; // Importamos el archivo CSS

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory] = useState([
    { id: 1, title: 'Consulta sobre planes de clase' },
    { id: 2, title: 'Ayuda con matemáticas' },
    { id: 3, title: 'Ideas para actividades' }
  ]);

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
                <span>{chat.title}</span>
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

import { useState } from 'react';
import '../styles/Foro.css';

const Foro = () => {
  const [chats] = useState([
    {
      id: 1,
      nombre: 'Matemáticas',
      ultimoMensaje: 'Tú: Yo también uso material concreto...',
      hora: '12:35 p.m.',
      icono: '🧮'
    },
    {
      id: 2,
      nombre: 'Lengua y Literatura',
      ultimoMensaje: 'Buenos Días estimados docentes...',
      hora: '9:23 a.m.',
      icono: '📚',
      notificaciones: 1
    },
    {
      id: 3,
      nombre: 'Ciencias Sociales',
      ultimoMensaje: 'Estos son los materiales para real...',
      hora: 'Ayer',
      icono: '🌎',
      notificaciones: 3
    },
    {
      id: 4,
      nombre: 'Ciencias Naturales',
      ultimoMensaje: 'Creo que voy a probar dibujos y rec...',
      hora: 'Ayer',
      icono: '🌿',
      notificaciones: 1
    }
  ]);

  return (
    <div className="foro-container">
      <div className="chats-sidebar">
        <div className="chats-header">
          <h2>Chats</h2>
          <button className="search-button">
            <span className="material-icons">search</span>
          </button>
        </div>
        <div className="chats-list">
          {chats.map((chat) => (
            <div key={chat.id} className="chat-item">
              <div className="chat-icon">{chat.icono}</div>
              <div className="chat-info">
                <div className="chat-name">{chat.nombre}</div>
                <div className="chat-message">{chat.ultimoMensaje}</div>
              </div>
              <div className="chat-meta">
                <div className="chat-time">{chat.hora}</div>
                {chat.notificaciones && (
                  <div className="chat-notifications">{chat.notificaciones}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-title">
            <span className="chat-icon">🧮</span>
            <h2>Matemáticas</h2>
          </div>
        </div>
        <div className="chat-messages">
          <div className="message">
            <div className="message-avatar">
              <img src="https://via.placeholder.com/40" alt="Jonathan" />
            </div>
            <div className="message-content">
              <div className="message-author">Jonathan</div>
              <div className="message-text">
                ¡Buenos días, colegas! Quería comentarles que mis estudiantes están teniendo dificultades con la multiplicación de fracciones. ¿Ustedes cómo lo están abordando?
              </div>
              <div className="message-time">12:01 p.m.</div>
            </div>
          </div>
          <div className="message">
            <div className="message-avatar">
              <img src="https://via.placeholder.com/40" alt="María C." />
            </div>
            <div className="message-content">
              <div className="message-author">María C.</div>
              <div className="message-text">
                ¡Buenos días! A mí me ha funcionado bastante el uso de materiales concretos, como recortes de papel o fracciones de pizza dibujadas. Cuando los estudiantes pueden visualizarlo, entienden mejor la idea de multiplicar partes de un todo.
              </div>
              <div className="message-time">12:30 p.m.</div>
            </div>
          </div>
          <div className="message">
            <div className="message-avatar">
              <img src="https://via.placeholder.com/40" alt="Usuario" />
            </div>
            <div className="message-content message-right">
              <div className="message-text">
                Yo también uso material concreto, pero además los pongo a trabajar en parejas para que se expliquen entre ellos.
              </div>
              <div className="message-time">12:35 p.m.</div>
            </div>
          </div>
        </div>
        <div className="chat-input">
          <input type="text" placeholder="Escribe aquí..." />
          <button className="send-button">
            <span className="material-icons">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Foro;

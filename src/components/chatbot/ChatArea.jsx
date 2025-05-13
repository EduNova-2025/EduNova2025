import React, { useState, useRef } from 'react';
import Chatbot from './Chatbot';
import { getAnswerFromFirebase } from '../chatbot/serviciosIA/firebaseService';
import './InputBox.css';

const ChatArea = () => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    const response = await getAnswerFromFirebase(message);
    setResponses([...responses, { user: message, ai: response }]);
    setMessage('');
    setAttachedFile(null); // Limpiar archivo adjunto después de enviar
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
      // Aquí puedes manejar el archivo seleccionado
      console.log('Archivo adjuntado:', file.name);
    }
  };

  return (
    <div className="chat-area justify-content-center text-center flex-grow-1 p-5">
      {responses.length === 0 && (
        <>
          <div className="masteria-title">Master IA</div>
          <h1 className="plan-title text-primary fw-bold">¿Listo para planificar?</h1>
        </>
      )}

      <Chatbot responses={responses} /> {/* Mostramos las respuestas del chat */}

      {/* Mostrar archivo adjunto arriba del input */}
      {attachedFile && (
        <div className="attached-file-preview">
          <span className="attached-file-name">{attachedFile.name}</span>
          <button
            className="discard-file-btn"
            type="button"
            title="Descartar archivo"
            onClick={() => setAttachedFile(null)}
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
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} // Permite enviar con Enter
          style={{ flex: 1 }}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          className="icon-btn attach-btn"
          type="button"
          onClick={handleAttachClick}
          title="Adjuntar archivo"
        >
          <span role="img" aria-label="Adjuntar">
            📎
          </span>
        </button>
        <button
          className="icon-btn send-btn"
          type="button"
          onClick={handleSend}
          title="Enviar"
        >
          <span role="img" aria-label="Enviar">
            📤
          </span>
        </button>
      </div>
    </div>
  );
};

export default ChatArea;

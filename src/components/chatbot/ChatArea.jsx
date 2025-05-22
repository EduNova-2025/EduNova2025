import React, { useState, useRef, useEffect } from 'react';
import Chatbot from './Chatbot';
import { getAnswerFromFirebase, resetChat, processUploadedPdf } from '../chatbot/serviciosIA/firebaseService';
import './InputBox.css';

const ChatArea = () => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Verificar conexión inicial con la IA
  useEffect(() => {
    const checkConnection = async () => {
      const testResponse = await getAnswerFromFirebase("Test connection");
      console.log("Estado de la conexión con la IA:", testResponse);
    };
    checkConnection();
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
  };

  return (
    <div className="chat-area justify-content-center text-center flex-grow-1 p-5">
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
              uploadedPdfText = ''; // Limpiar el texto del PDF si se descarta
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
        <button
          className="new-chat-btn"
          type="button"
          onClick={handleNewChat}
          title="Nuevo Chat"
        >
          <span role="img" aria-label="Nuevo Chat">+</span>
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
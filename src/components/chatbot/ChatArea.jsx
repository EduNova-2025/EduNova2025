import React, { useState } from 'react';
import Chatbot from './Chatbot';
import { getAnswerFromFirebase } from '../chatbot/serviciosIA/firebaseService';
import './InputBox.css';

const ChatArea = () => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Primero, obtenemos la respuesta de Firebase y OpenAI
    const response = await getAnswerFromFirebase(message);
    
    // Actualizamos las respuestas del chat
    setResponses([...responses, { user: message, ai: response }]);
    setMessage(''); // Limpiamos el campo de entrada
  };

  return (
    <div className="chat-area d-flex flex-column align-items-center justify-content-center text-center flex-grow-1 p-5">
      {responses.length === 0 && (
        <>
          <div className="masteria-title">Master IA</div>
          <h1 className="plan-title text-primary fw-bold">¿Listo para planificar?</h1>
        </>
      )}

      <Chatbot responses={responses} /> {/* Mostramos las respuestas del chat */}

      <div className="input-container">
        <input
          type="text"
          className="input-box"
          value={message}
          placeholder="Escribe tu pregunta..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} // Permite enviar con Enter
        />
      </div>
    </div>
  );
};

export default ChatArea;

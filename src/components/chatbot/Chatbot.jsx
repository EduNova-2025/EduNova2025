import React, { useEffect, useRef } from 'react';
import './InputBox.css';
import aiAvatarImg from '../../assets/robot-bot-icon.png';

const Chatbot = ({ responses, isAIProcessing }) => {
  const chatContainerRef = useRef(null);
  const aiAvatar = aiAvatarImg;

  useEffect(() => {
    if (chatContainerRef.current) {
      const scrollToBottom = () => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      };
      scrollToBottom();
      // Agregar un pequeño delay para asegurar que el scroll funcione después de que el contenido se haya renderizado
      setTimeout(scrollToBottom, 100);
    }
  }, [responses, isAIProcessing]);

  return (
    <div className="chat-container" ref={chatContainerRef}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {responses.map((response, index) => (
          <React.Fragment key={index}>
            {response.user && (
              <div className="chat-bubble-container user-container">
                <div className="chat-bubble user">{response.user}</div>
              </div>
            )}
            {response.ai && (
              <div className="chat-bubble-container ai-container">
                <img src={aiAvatar} alt="AI Avatar" className="ai-avatar" />
                <div className="chat-bubble ai">{response.ai}</div>
              </div>
            )}
          </React.Fragment>
        ))}
        {isAIProcessing && (
          <div className="chat-bubble-container ai-container">
            <img src={aiAvatar} alt="AI Avatar" className="ai-avatar" />
            <div className="chat-bubble ai typing">
              <span className="typing-animation">Escribiendo<span className="dots">...</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
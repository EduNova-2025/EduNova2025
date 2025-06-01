import React from 'react';
import './InputBox.css';
import aiAvatarImg from '../../assets/robot-bot-icon.png';

const Chatbot = ({ responses, isAIProcessing }) => {
  // URL de la imagen de perfil (reemplaza con tu propia imagen)
  const aiAvatar = aiAvatarImg;

  return (
    <div className="chat-container">
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
  );
};

export default Chatbot;
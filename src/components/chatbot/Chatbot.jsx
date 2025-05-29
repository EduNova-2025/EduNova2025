import React from 'react';
import './InputBox.css';

const Chatbot = ({ responses }) => {
  return (
    <div className="chat-container">
      {responses.map((item, index) => (
        <React.Fragment key={index}>
          {/* Usuario */}
          <div className="chat-bubble-container">
            <div className="chat-bubble user">{item.user}</div>
          </div>

          {/* IA */}
          <div className="chat-bubble-container">
            <div className="chat-bubble ai">{item.ai}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Chatbot;
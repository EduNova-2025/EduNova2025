import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './InputBox.css'; // Importa el archivo de estilos

const InputBox = ({ onSendMessage, onFileUpload, isProcessing }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
      onFileUpload(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-box">
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('chat.escribeMensaje')}
          disabled={isProcessing}
          className="message-input"
        />
        <div className="input-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="file-input"
            disabled={isProcessing}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="attach-btn"
            disabled={isProcessing}
            title={t('chat.adjuntarArchivo')}
          >
            📎
          </button>
          <button
            type="submit"
            disabled={!message.trim() || isProcessing}
            className="send-btn"
            title={t('chat.enviar')}
          >
            📤
          </button>
        </div>
      </div>
      {attachedFile && (
        <div className="attached-file-preview">
          <span className="attached-file-name">{attachedFile.name}</span>
          <button
            className="discard-file-btn"
            type="button"
            title={t('chat.descartarArchivo')}
            onClick={() => {
              setAttachedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            ✖
          </button>
        </div>
      )}
    </form>
  );
};

export default InputBox;
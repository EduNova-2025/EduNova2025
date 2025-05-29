import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import './InputBox.css'; // Importa el archivo de estilos

const InputBox = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    onSend?.();
    setMessage('');
  };

  return (
    <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Form.Control
        className="input-box"
        type="text"
        placeholder="Escribe aquí..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
    </Form>
  );
};

export default InputBox;
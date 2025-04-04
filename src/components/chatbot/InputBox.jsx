import React from 'react';
import './InputBox.css';  // Importa el archivo CSS

const InputBox = () => {
  return (
    <input 
      type="text" 
      placeholder="Escribe aquí..." 
      className="input-box"
    />
  );
};

export default InputBox;

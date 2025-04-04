import React from 'react';
import InputBox from './InputBox';

const ChatArea = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center flex-grow-1 p-5" style={{ background: '#F0F0F0', height: '100vh', position: 'relative' }}>
        
        {/* Texto "MasterIA" en la esquina superior izquierda con gradiente */}
        <div style={{
          position: 'absolute',
          top: '100px',  // Distancia desde la parte superior
          left: '120px', // Distancia desde la parte izquierda
          fontSize: '30px',
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #3357FF, rgb(81, 27, 101), #FF33A6)', // Gradiente de colores actualizado
          color: 'transparent',  // Hace que el color del texto sea transparente
          backgroundClip: 'text',  // Aplica el gradiente solo al texto
          WebkitBackgroundClip: 'text', // Asegura compatibilidad en WebKit (Chrome, Safari, etc.)
          padding: '5px',  // Padding para darle un poco de espacio
        }}>
          Master IA
        </div>

        <h1 className="text-primary fw-bold" style={{
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',  // Sombras sutiles al texto
          fontSize: '2rem',
        }}>¿Listo para planificar?</h1>

        {/* Contenedor para el InputBox con posicionamiento absoluto */}
        <div style={{
          position: 'absolute',
          bottom: '80px', // Lo coloca en la parte inferior
          left: '50%', // Centrado horizontalmente
          transform: 'translateX(-50%)', // Ajusta el centro del input
          width: '80%',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <InputBox />
        </div>
    </div>
  );
};

export default ChatArea;

import React from 'react';
import { Button } from 'react-bootstrap';
import { BsList, BsPlus } from 'react-icons/bs'; // Importamos los íconos de React Icons
import './InputBox.css'; // Importamos el archivo CSS

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* Botón hamburguesa con ícono */}
      <Button
        variant="link"
        className="hamburger-btn"
      >
        <BsList size={30} /> {/* Aquí agregas el ícono de hamburguesa */}
      </Button>

      {/* Botón + con ícono */}
      <Button
        variant="light"
        className="add-btn"
      >
        <BsPlus size={40} /> {/* Aquí agregas el ícono de "+" */}
      </Button>
    </aside>
  );
};

export default Sidebar;

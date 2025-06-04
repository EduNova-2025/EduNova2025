import { useNavigate } from 'react-router-dom';
import '../styles/Roles.css';  // Importación del archivo CSS

export default function SeleccionarRol() {
const navigate = useNavigate();

const manejarSeleccion = (rol) => {
    switch (rol) {
    case 'Docente':
        navigate('/registro-docente');
        break;
    case 'Mined':
        navigate('/registro-gestor');
        break;
    }
};

return (
    <div className="seleccionar-rol-container">
    <h1 className="seleccionar-rol-title">¿Qué tipo de usuario eres?</h1>
    <div className="seleccionar-rol-buttons">
        <button
        onClick={() => manejarSeleccion('Docente')}
        className="seleccionar-rol-button docente-button"
        >
        Docente
        </button>
        <button
        onClick={() => manejarSeleccion('Mined')}
        className="seleccionar-rol-button gestor-button"
        >
        Gestor educativo
        </button>
    </div>
    </div>
);
}
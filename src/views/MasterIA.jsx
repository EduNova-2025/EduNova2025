import { useNavigate } from "react-router-dom";

const Inicio = () => {

    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
    navigate(path);
    };

return (
    <div>
    <br />
    <br />
    <h1>MasterIA</h1>
    <button onClick={() => handleNavigate("/inicio")} >Ir a Inicio</button>
    </div>
)
}

export default Inicio;
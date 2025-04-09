import React from 'react';

const BuscadorTeleclases = ({ onSearch }) => {
    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        onSearch(searchTerm);
    };

    return (
        <div className="busqueda-contenedor">
            <span className="titulo-busqueda">Teleclases</span>
            <div className="campo-busqueda-container">
                <input 
                    type="text" 
                    placeholder="Buscar por descripción" 
                    className="campo-busqueda"
                    onChange={handleSearch}
                />
            </div>
        </div>
    );
};

export default BuscadorTeleclases; 
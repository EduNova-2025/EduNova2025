import React from 'react';
import { useTranslation } from 'react-i18next';

const BuscadorTeleclases = ({ onSearch }) => {
    const { t } = useTranslation();

    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        onSearch(searchTerm);
    };

    return (
        <div className="busqueda-contenedor">
            <span className="titulo-busqueda">{t('teleclase.Teleclase')}</span>
            <div className="campo-busqueda-container">
                <input 
                    type="text" 
                    placeholder={t('teleclase.buscarTeleclases')} 
                    className="campo-busqueda"
                    onChange={handleSearch}
                />
            </div>
        </div>
    );
};

export default BuscadorTeleclases; 
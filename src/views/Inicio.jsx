import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import '../App.css'; // Importa el archivo CSS

const Inicio = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="inicio-container">
            
        <svg className="bg-svg" viewBox="0 0 800 600">
            <circle cx="400" cy="300" r="300" fill="url(#gradient)" />
            <defs>
            <radialGradient id="gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(400 300) scale(300)">
                <stop stopColor="#ffffff" />
                <stop offset="1" stopColor="#a78bfa" />
            </radialGradient>
            </defs>
        </svg>

        <div className="inicio-button-container">
            <motion.h1
            className="inicio-title"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            >
             {t('inicio.titulo')}
            </motion.h1>

            <motion.p
            className="inicio-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            >
            {t('inicio.descripcion')}
            </motion.p>

            <div className="button-group">
            <motion.button
                className="inicio-button"
                onClick={() => handleNavigate("/catalogo")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
            >
                {t('menu.biblioteca')}
            </motion.button>
            <motion.button
                className="inicio-button"
                onClick={() => handleNavigate("/teleclase")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
            >
                {t('menu.teleclases')}
            </motion.button>
            <motion.button
                className="inicio-button"
                onClick={() => handleNavigate("/ia")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
            >
                {t('menu.masterIA')}
            </motion.button>
            <motion.button
                className="inicio-button"
                onClick={() => handleNavigate("/foro")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
            >
                {t('menu.foro')}
            </motion.button>
            <motion.button
                className="inicio-button"
                onClick={() => handleNavigate("/conferencia")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
            >
                {t('menu.conferencias')}
            </motion.button>
            </div>
        </div>
        </div>
    );
    };

    export default Inicio;

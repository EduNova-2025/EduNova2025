import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { Zoom } from "react-awesome-reveal";
import edunovaImageLogo from "../assets/Logo_SinFondo.png";
import "../App.css"; // Importa el archivo CSS

const Welcome = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleNavigate = (path) => {
        navigate(path);
    };

    // Define animation variants for Framer Motion
    const variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 2 } },
    };

    return (
        <motion.div
        className="inicio-container"
        initial="hidden"
        animate="visible"
        variants={variants}
        >
        {/* Imagen principal */}
        <motion.img
            src={edunovaImageLogo}
            alt="EduNova Logo"
            className="edunova-inicio-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
        />

        <svg className="bg-svg" viewBox="0 0 800 600">
            <circle cx="400" cy="300" r="300" fill="url(#gradient)" />
            <defs>
            <radialGradient
                id="gradient"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(400 300) scale(300)"
            >
                <stop stopColor="#ffffff" />
                <stop offset="1" stopColor="#a78bfa" />
            </radialGradient>
            </defs>
        </svg>

        <div className="inicio-button-container">
            <Zoom cascade triggerOnce delay={10} duration={2000}>
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
            </Zoom>
        </div>
        </motion.div>
    );
    };

export default Welcome;
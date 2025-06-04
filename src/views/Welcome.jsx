import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import "../App.css"; // Importa el archivo CSS
import edunovaImage from "../assets/Edunova-192x192-purple.png"; // Asegúrate de tener esta imagen en tu carpeta de assets

const Welcome = () => {
  const { t } = useTranslation();

  // Define animation variants for Framer Motion
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 2 } },
  };

  return (
    <motion.div
      className="welcome-container"
      initial="hidden"
      animate="visible"
      variants={variants}
    >
    {/* Imagen principal */}
    <motion.img
        src={edunovaImage}
        alt="EduNova Logo"
        className="edunova-image-logo"
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

      <div className="welcome-button-container">
        <motion.h1
          className="welcome-title"
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
      </div>
    </motion.div>
  );
};

export default Welcome;
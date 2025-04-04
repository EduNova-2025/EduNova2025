
    import { motion } from "framer-motion";
    import minedImage from "../assets/mined.jpg";
    import teleClasesVideo from "../assets/TeleClases.m4v";
    import classroomImage from "../assets/tic.jpg"; 
    import teacherImage from "../assets/docentes.jpg";

    const Bienvenida = () => {
    return (
        <div className="edunova-container">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="edunova-content"
        >
            <h1 className="edunova-title">Bienvenido a EduNova</h1>
            <p className="edunova-description">
            Una plataforma educativa inteligente que transforma la planificación y 
            enseñanza en quinto grado de primaria. Automatiza los planes de clase, 
            facilita recursos digitales y fomenta la capacitación docente, todo 
            desde una única PWA.
            </p>

            {/* Imagen principal */}
            <motion.img
            src={minedImage}
            alt="EduNova App"
            className="edunova-image"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            />

            {/* Cuadros de información */}
            <motion.div
            className="info-box"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            >
            <img src={classroomImage} alt="Aula Digital" className="info-image" />
            <p>
                📚 EduNova integra herramientas de planificación automática, 
                facilitando la enseñanza en el aula con recursos digitales innovadores.
            </p>
            </motion.div>

            <motion.div
            className="info-box"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1 }}
            >
            <img src={teacherImage} alt="Docente Capacitado" className="info-image" />
            <p>
                🎓 Capacitación docente con videoclases y herramientas interactivas, 
                fortaleciendo el aprendizaje en las aulas de primaria.
            </p>
            </motion.div>

            {/* Video de muestra */}
            <video className="edunova-video" controls autoPlay muted loop>
            <source src={teleClasesVideo} type="video/mp4" />
            </video>
        </motion.div>
        <footer className="edunova-footer">
            <p>© {new Date().getFullYear()} EduNova • Plataforma educativa de Juigalpa</p>
            <p>Creado para fortalecer la enseñanza primaria con tecnología e innovación.</p>
        </footer>
        </div>
    );
    };

    export default Bienvenida;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import LoginForm from "../components/LoginForm";
import { appfirebase } from "../database/firebaseconfig";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../database/authcontext";
import ReactGA from "react-ga4";

import "../styles/LoginForm.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const auth = getAuth(appfirebase);

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Tracking GA
            ReactGA.event({
              category: "Usuarios",
              action: "Inicio de Sesión",
              label: email,
            });
            // Guardar las credenciales en localStorage
            localStorage.setItem("adminEmail", email);
            localStorage.setItem("adminPassword", password);
            // Redirigir después de iniciar sesión
            navigate("/inicio");
        })
        .catch((error) => {
            setError("Error de autenticación. Verifica tus credenciales.");
            console.error(error);
        });
    };

    // Si el usuario ya está autenticado, redirigir automáticamente
    if (user) {
        navigate("/inicio");
    }

    return (
        <Container className="d-flex vh-100 justify-content-center align-items-center">
            <LoginForm
                email={email}
                password={password}
                error={error}
                setEmail={setEmail}
                setPassword={setPassword}
                handleSubmit={handleSubmit}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />
        </Container>
    );
};

export default Login;
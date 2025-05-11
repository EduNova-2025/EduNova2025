import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { appfirebase } from "../database/firebaseconfig";
import "../styles/LoginForm.css";

const LoginForm = ({ email, password, error, setEmail, setPassword, handleSubmit }) => {
  return (
    <Row className="w-100 justify-content-center">
      <Col xs={12} sm={10} md={8} lg={6} xl={5}>
        <div className="login-container">
          <div className="main">
            <div className="login">
              <form onSubmit={handleSubmit}>
                <label htmlFor="chk" aria-hidden="true" className="label-login">
                  Iniciar Sesión
                </label>
                {error && <div className="error-message">{error}</div>}
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Correo electrónico" 
                  required 
                  className="input-login"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                  type="password" 
                  name="pswd" 
                  placeholder="Contraseña" 
                  required 
                  className="input-login"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="button-login">Iniciar Sesión</button>
              </form>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const auth = getAuth(appfirebase);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Usuario autenticado:", userCredential.user);
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

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
      <LoginForm
        email={email}
        password={password}
        error={error}
        setEmail={setEmail}
        setPassword={setPassword}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default Login;

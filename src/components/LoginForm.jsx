import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { registerUser, loginUser, registerWithGoogle } from "../services/authService.jsx";
import "../styles/LoginForm.css";
import iconoGoogle from "../assets/iconoGoogle.png";

const LoginForm = ({ email, password, error, setEmail, setPassword, handleSubmit }) => {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [registerError, setRegisterError] = useState("");
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const result = await loginUser(email, password);
    if (result.success) {
      handleSubmit(e);
    } else {
      setError(result.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setEmailAlreadyRegistered(false);

    if (!username || !registerEmail || !registerPassword) {
      setRegisterError("Por favor complete todos los campos");
      return;
    }

    const result = await registerUser(registerEmail, registerPassword, username, phoneNumber);

    if (result.success) {
      // Limpiar el formulario y cambiar a login
      setUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
      setPhoneNumber("");
      setIsLogin(true);
    } else {
      setRegisterError(result.error);
      if (result.error === "El correo ya está registrado.") {
        setEmailAlreadyRegistered(true);
        alert("El correo ya ha sido registrado. Por favor, utiliza otro correo o inicia sesión.");
      }
    }
  };

  // Agrega esta función para el registro con Google
  const handleGoogleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setEmailAlreadyRegistered(false);
    const result = await registerWithGoogle();
    if (result.success && result.alreadyRegistered) {
      setRegisterError("Este correo ya está registrado. Por favor, inicia sesión.");
      setIsLogin(true); // Cambia a la vista de inicio de sesión
    } else if (result.success) {
      setIsLogin(true);
    } else {
      setRegisterError(result.error);
    }
  };

  return (
    <Row className="w-100 justify-content-center">
      <Col xs={12} sm={10} md={8} lg={6} xl={5}>
        <div className="login-container">
          <div className="main">
            <input 
              type="checkbox" 
              id="chk" 
              aria-hidden="true" 
              className="input-login"
              checked={!isLogin}
              onChange={() => setIsLogin(!isLogin)}
            />

            <div className="signup">
              <form onSubmit={handleRegisterSubmit}>
                <label htmlFor="chk" aria-hidden="true" className="label-register">Registrarse</label>
                {registerError && <div className="error-message">{registerError}</div>}
                <input 
                  type="text" 
                  name="txt" 
                  placeholder="Nombre de usuario" 
                  required 
                  className="input-register"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={emailAlreadyRegistered}
                />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Correo electrónico" 
                  required 
                  className="input-register"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  disabled={emailAlreadyRegistered}
                />
                <input 
                  type="number" 
                  name="phone" 
                  placeholder="Número de teléfono" 
                  className="input-register"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={emailAlreadyRegistered}
                />
                <input 
                  type="password" 
                  name="pswd" 
                  placeholder="Contraseña" 
                  required 
                  className="input-register"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={emailAlreadyRegistered}
                />
                <button type="submit" className="button-register" disabled={emailAlreadyRegistered}>Registrarse</button>
              </form>
            </div>

            <div className="login">
              <form onSubmit={handleLoginSubmit}>
                <label htmlFor="chk" aria-hidden="true" className="label-login">Iniciar Sesión</label>
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
                <div className="separator-or">
                  <span>O</span>
                </div>
                <div className="google-login-icon" onClick={handleGoogleRegister} style={{cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px"}}>
                  <img src={iconoGoogle} alt="Google" className="google-icon" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default LoginForm;
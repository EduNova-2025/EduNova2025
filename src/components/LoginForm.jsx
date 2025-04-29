import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { registerUser, loginUser } from "../services/authService.jsx";
import "../styles/LoginForm.css";

const LoginForm = ({ email, password, error, setEmail, setPassword, handleSubmit }) => {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [registerError, setRegisterError] = useState("");

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
                <label htmlFor="chk" aria-hidden="true" className="label-login">Registrarse</label>
                {registerError && <div className="error-message">{registerError}</div>}
                <input 
                  type="text" 
                  name="txt" 
                  placeholder="Nombre de usuario" 
                  required 
                  className="input-login"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Correo electrónico" 
                  required 
                  className="input-login"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
                <input 
                  type="number" 
                  name="phone" 
                  placeholder="Número de teléfono" 
                  className="input-login"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <input 
                  type="password" 
                  name="pswd" 
                  placeholder="Contraseña" 
                  required 
                  className="input-login"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
                <button type="submit" className="button-login">Registrarse</button>
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
              </form>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default LoginForm;
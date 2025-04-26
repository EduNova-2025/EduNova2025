import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import "../styles/LoginForm.css";

const LoginForm = ({ email, password, error, setEmail, setPassword, handleSubmit }) => {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes implementar la lógica para el registro
    console.log("Registro:", { username, email: registerEmail, phone: phoneNumber, password: registerPassword });
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
                  required 
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
                <button type="submit" className="button-login" >Registrarse</button>
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
    import React from "react";
    import { Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
    import "../App.css";

    const LoginForm = ({ email, password, error, setEmail, setPassword, handleSubmit }) => {
    return (
      <Row className="w-100 justify-content-center login-background">
        <Col md={6} lg={5} xl={4}>
          <Card className="p-4 shadow-lg borderCard">
            <Card.Body>
              <h3 className="text-center mb-4 title">Iniciar Sesión</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="emailUsuario">
                  <Form.Label className="title">Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="animated-input"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="contraseñaUsuario">
                  <Form.Label className="title" >Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="animated-input"
                  />
                </Form.Group>

                <Button type="submit" className="w-100 gradient-button">
                  Iniciar Sesión
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    );
    };

    export default LoginForm;
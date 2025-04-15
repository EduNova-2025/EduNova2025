import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import logo from "../assets/logo-edu.png";
import { useAuth } from "../database/authcontext";
import 'bootstrap-icons/font/bootstrap-icons.css';
import NavDropdown from "react-bootstrap/NavDropdown";

import "../App.css";

if (isLoggedIn) return null;


const Encabezado = () => {
const [isCollapsed, setIsCollapsed] = useState(false);
const { isLoggedIn, logout } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
    try {
    // Cerrar el offcanvas antes de proceder
    setIsCollapsed(false);

    // Eliminar variables almacenadas en localStorage
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminPassword");

    // Cerrar sesión
    await logout();

    // Redirigir al inicio
    navigate("/");
    } catch (error) {
    console.error("Error al cerrar sesión:", error);
    }
};

const handleToggle = () => setIsCollapsed(!isCollapsed);

// Funciones de navegación
const handleNavigate = (path) => {
    navigate(path);
    setIsCollapsed(false);
};

return (
    <Navbar expand="sm" fixed="top" className="color-navbar">
    <Container>
        <Navbar.Brand onClick={() => handleNavigate("/inicio")} className="text-white" style={{ cursor: "pointer" }}>
        <img alt="" src={logo} width="30" height="30" className="d-inline-block align-top" />{" "}
        <strong>EduNova</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-sm" onClick={handleToggle} />
        <Navbar.Offcanvas
        id="offcanvasNavbar-expand-sm"
        aria-labelledby="offcanvasNavbarLabel-expand-sm"
        placement="end"
        show={isCollapsed}
        onHide={() => setIsCollapsed(false)}
        >
        <Offcanvas.Header closeButton>
            <Offcanvas.Title
            id="offcanvasNavbarLabel-expand-sm"
            className={isCollapsed ? "color-texto-marca" : "text-white"}
            >
            Menú
            </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">

            {/* Opción de Inicio */}
            <Nav.Link
                onClick={() => handleNavigate("/inicio")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
            >
                {isCollapsed ? <i className="bi-house-door-fill me-2"></i> : null}
                <strong>Inicio</strong>
            </Nav.Link>

            {/* Opciones visibles solo si el usuario está logueado */}
            {isLoggedIn && (
                <>
                <NavDropdown
                        title={<span className={isCollapsed ? "color-texto-marca" : "text-white"}><strong>Biblioteca Digital</strong></span>}
                        id="biblioteca-dropdown"
                        className={isCollapsed ? "" : "nav-dropdown-white"}
                        >
                        <NavDropdown.Item onClick={() => handleNavigate("/categorias")}>
                            Categorías
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => handleNavigate("/books")}>
                            General
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => handleNavigate("/catalogo")}>
                            Libros
                        </NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown
                        title={<span className={isCollapsed ? "color-texto-marca" : "text-white"}><strong>Teleclases</strong></span>}
                        id="teleclase-dropdown"
                        className={isCollapsed ? "" : "nav-dropdown-white"}
                        >
                        <NavDropdown.Item onClick={() => handleNavigate("/teleclase")}>
                                General
                            </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => handleNavigate("/teleclasemined")}>
                            MINED
                        </NavDropdown.Item>
                    </NavDropdown>
                <Nav.Link
                    onClick={() => handleNavigate("/ia")}
                    className={isCollapsed ? "color-texto-marca" : "text-white"}
                >
                    {isCollapsed ? <i className="bi-brain-fill me-2"></i> : null}
                    <strong>MasterIA</strong>
                </Nav.Link>

                <Nav.Link
                    onClick={() => handleNavigate("/foro")}
                    className={isCollapsed ? "color-texto-marca" : "text-white"}
                >
                    {isCollapsed ? <i className="bi-brain-fill me-2"></i> : null}
                    <strong>Foro</strong>
                </Nav.Link>
                </>
            )}

            {/* Cerrar sesión / Iniciar sesión */}
            {isLoggedIn ? (
                <Nav.Link onClick={handleLogout} className={isCollapsed ? "text-black" : "text-white"}>
                Cerrar Sesión
                </Nav.Link>
            ) : location.pathname === "/" && (
                <Nav.Link
                onClick={() => handleNavigate("/login")}
                className={isCollapsed ? "text-black" : "text-white"}
                >
                Iniciar Sesión
                </Nav.Link>
            )}

            </Nav>
        </Offcanvas.Body>
        </Navbar.Offcanvas>
    </Container>
    </Navbar>
);
};

export default Encabezado;
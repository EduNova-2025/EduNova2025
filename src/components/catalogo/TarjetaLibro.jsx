import React from "react";
import { Card, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../styles/Catalogo.css"
import ReactGA from "react-ga4";
import { Zoom } from "react-awesome-reveal";

const TarjetaLibro = ({ libro }) => {
    const handlePdfClick = () => {
        ReactGA.event({
            category: libro.categoria || 'Sin categoría',
            action: "Leer PDF",
            label: libro.titulo
        });
    };

    return (
        <Col lg={3} md={4} sm={12} className="tarjeta-libro-col mb-4">
            <Zoom cascade triggerOnce delay={10} duration={600}>x
            <Link to={`/libro/${libro.id}`} className="text-decoration-none text-dark" onClick={handlePdfClick}>
                <Card className="tarjeta-libro h-100">
                    {libro.imagen && (
                        <Card.Img
                            variant="top"
                            src={libro.imagen}
                            alt={libro.titulo}
                            className="tarjeta-libro-img"
                        />
                    )}
                    <Card.Body className="tarjeta-libro-body">
                        <Card.Title className="tarjeta-libro-title">
                            {libro.titulo}
                        </Card.Title>
                    </Card.Body>
                </Card>
            </Link>
            </Zoom>
        </Col>
    );
};

export default TarjetaLibro;

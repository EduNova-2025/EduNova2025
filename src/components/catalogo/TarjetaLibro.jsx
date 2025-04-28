import { Card, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../styles/Catalogo.css"

const TarjetaLibro = ({ libro }) => {
    return (
        <Col lg={3} md={4} sm={12} className="tarjeta-libro-col mb-4">
            <Link to={`/libro/${libro.id}`} className="text-decoration-none text-dark">
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
        </Col>
    );
};

export default TarjetaLibro;

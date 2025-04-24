import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../database/firebaseconfig";
import { Container, Card, Spinner, Row, Col } from "react-bootstrap";
import '../styles/DetalleLibro.css'

const DetalleLibro = () => {
    const { id } = useParams();
    const [libro, setLibro] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const obtenerLibro = async () => {
            const docRef = doc(db, "libros", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setLibro(docSnap.data());
            } else {
                console.error("No se encontró el libro.");
            }
            setLoading(false);
        };

        obtenerLibro();
    }, [id]);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (!libro) {
        return (
            <Container className="text-center mt-5">
                <p>No se pudo cargar el libro.</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Card className="p-4 detalle-libro-card">
                <h2 className="detalle-libro-titulo">{libro.titulo}</h2>
                <Row>
                    <Col md={5} className="text-center mb-3 mb-md-0">
                        {libro.imagen && (
                            <img
                                src={libro.imagen}
                                alt={libro.titulo}
                                className="img-fluid detalle-libro-img"
                                style={{ maxHeight: "300px", objectFit: "contain" }}
                            />
                        )}
                    </Col>
                    <Col md={7} className="detalle-libro-texto">
                        <p><strong>Área educativa:</strong> {libro.area_edu}</p>
                        <p><strong>Dirigido a:</strong> {libro.dirigido}</p>
                        <p><strong>Edición:</strong> {libro.edicion}</p>
                        <p><strong>Descripción:</strong> {libro.descripcion}</p>
                        <p><strong>Categoría:</strong> {libro.categoria}</p>
                        {libro.pdfUrl && (
                            <p className="detalle-libro-enlace">
                                <a href={libro.pdfUrl} target="_blank" rel="noopener noreferrer">
                                    Ver PDF
                                </a>
                            </p>
                        )}
                    </Col>
                </Row>
            </Card>
        </Container>
    );
};

export default DetalleLibro;

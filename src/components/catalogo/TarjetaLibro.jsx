import { useState } from "react";
import { Card, Col, Modal, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaLibro = ({ libro }) => {
    const [showModal, setShowModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setIsFullscreen(false); // restablece al cerrar
    };

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    return (
        <Col lg={3} md={4} sm={12} className="tarjeta-libro-col mb-4">
            <Card className="tarjeta-libro">
                {libro.imagen && (
                    <Card.Img variant="top" src={libro.imagen} alt={libro.titulo} className="tarjeta-libro-img"/>
                )}
                <Card.Body className="tarjeta-libro-body">
                    <Card.Title className="tarjeta-libro-title">{libro.titulo}</Card.Title>
                    <Card.Text className="tarjeta-libro-text">
                        Área educativa: {libro.area_edu} <br />
                        Dirigido a: {libro.dirigido}
                        <br />
                        {libro.pdfUrl && (
                            <Button variant="link" onClick={handleOpenModal} className="tarjeta-libro-btn">
                                Ver PDF
                            </Button>
                        )}
                    </Card.Text>
                </Card.Body>
            </Card>

            {/* Modal con visor PDF */}
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                size="lg"
                centered
                fullscreen={isFullscreen}
                className="tarjeta-libro-modal"
            >
                {!isFullscreen && (
                    <Modal.Header closeButton className="tarjeta-libro-modal-header">
                        <Modal.Title>{libro.titulo}</Modal.Title>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="ms-2 tarjeta-libro-fullscreen-btn"
                            onClick={toggleFullscreen}
                        >
                            Pantalla completa
                        </Button>
                    </Modal.Header>
                )}

                <Modal.Body className="tarjeta-libro-modal-body p-0">
                    <iframe
                        src={libro.pdfUrl}
                        title="PDF Viewer"
                        width="100%"
                        height={isFullscreen ? "600vh" : "500px"}
                        style={{ border: "none" }}
                        allowFullScreen
                    />
                </Modal.Body>

                {!isFullscreen && (
                    <Modal.Footer className="tarjeta-libro-modal-footer">
                        <Button variant="secondary" onClick={handleCloseModal} className="tarjeta-libro-btn">
                            Cerrar
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </Col>
    );
};

export default TarjetaLibro;
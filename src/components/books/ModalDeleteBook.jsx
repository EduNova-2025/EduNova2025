import React from "react";
import { Modal, Button } from "react-bootstrap";
import ReactGA from "react-ga4";

ReactGA.initialize([
  {
    trackingId: "G-7VB065E7DH",
    gaOptions: {
      siteSpeedSampleRate: 100
    }
  }
]);

const ModalEliminacionLibro = ({
showDeleteModal,
setShowDeleteModal,
handleDeleteLibro,
}) => {
  // Función para rastrear la eliminación de libro
  const trackLibroDelete = () => {
    ReactGA.event({
      category: "Libros",
      action: "Eliminación",
      origin: "registroteleclases"
    });
  };

  // Modificar handleDeleteLibro para incluir el tracking
  const handleDeleteLibroWithTracking = () => {
    handleDeleteLibro();
    trackLibroDelete();
  };

  return (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">Confirmar Eliminación</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        ¿Estás seguro de que deseas eliminar este libro?
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
        Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteLibroWithTracking}>
        Eliminar
        </Button>
    </Modal.Footer>
    </Modal>
);
};

export default ModalEliminacionLibro;
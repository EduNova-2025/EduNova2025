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

const ModalEliminacionCategoria = ({
showDeleteModal,
setShowDeleteModal,
handleDeleteCategoria,
}) => {

// Función para rastrear la eliminación de categoría
const trackCategoriaDelete = () => {
  ReactGA.event({
    category: "Categorías",
    action: "Eliminación",
    origin: "registroteleclases"
  });
};

// Modificar handleDeleteCategoria para incluir el tracking
const handleDeleteCategoriaWithTracking = () => {
  handleDeleteCategoria();
  trackCategoriaDelete();
};

return (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
    <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">Confirmar Eliminación</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        ¿Estás seguro de que deseas eliminar esta categoría?
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
        Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteCategoriaWithTracking}>
        Eliminar
        </Button>
    </Modal.Footer>
    </Modal>
);
};

export default ModalEliminacionCategoria;
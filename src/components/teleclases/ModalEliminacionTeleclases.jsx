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

const ModalEliminacionTeleclases = ({
  showModal,
  setShowModal,
  handleDeleteTeleclase,
  teleclaseTitle,
}) => {
  // Función para rastrear la eliminación de teleclases
  const trackTeleclaseDelete = () => {
    ReactGA.event({
      category: "Teleclases",
      action: "Eliminación",
      label: teleclaseTitle,
      origin: "registroteleclases"
    });
  };

  // Modificar handleDeleteTeleclase para incluir el tracking
  const handleDeleteTeleclaseWithTracking = () => {
    handleDeleteTeleclase();
    trackTeleclaseDelete();
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>¿Está seguro que desea eliminar la teleclase?</p>
        <p className="text-danger">Esta acción no se puede deshacer.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteTeleclaseWithTracking}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionTeleclases;

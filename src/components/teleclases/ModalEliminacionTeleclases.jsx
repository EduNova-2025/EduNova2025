import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionTeleclases = ({
  showModal,
  setShowModal,
  handleDeleteTeleclase,
  teleclaseTitle,
}) => {
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
        <Button variant="danger" onClick={handleDeleteTeleclase}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionTeleclases;

import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroTeleclases = ({
  showModal,
  setShowModal,
  nuevaTeleclase,
  handleInputChange,
  handleVideoChange,
  handleAddTeleclase,
}) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Teleclase</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              name="titulo"
              value={nuevaTeleclase.titulo}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Materia</Form.Label>
            <Form.Control
              type="text"
              name="materia"
              value={nuevaTeleclase.materia}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              type="text"
              name="descripcion"
              value={nuevaTeleclase.descripcion}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Archivo de Video</Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAddTeleclase}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroTeleclases;

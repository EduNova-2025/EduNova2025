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
        <Modal.Title className="modal-title-custom">Agregar Teleclase</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Título</Form.Label>
            <Form.Control
              type="text"
              name="titulo"
              placeholder="Agrega un título"
              value={nuevaTeleclase.titulo}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Materia</Form.Label>
            <Form.Control
              type="text"
              name="materia"
              placeholder="Define una materia"
              value={nuevaTeleclase.materia}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Descripción</Form.Label>
            <Form.Control
              type="text"
              name="descripcion"
              placeholder="Escribe aqui"
              value={nuevaTeleclase.descripcion}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Archivo de Video</Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="form-control-custom"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </Button>
        <Button className="btn-style" onClick={handleAddTeleclase}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroTeleclases;

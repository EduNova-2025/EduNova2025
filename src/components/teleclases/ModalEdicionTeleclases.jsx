import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionTeleclases = ({
  showModal,
  setShowModal,
  teleclase,
  handleInputChange,
  handleVideoChange,
  handleEditTeleclase,
}) => {
  if (!teleclase) return null;

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Teleclase</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              name="titulo"
              value={teleclase.titulo}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Materia</Form.Label>
            <Form.Control
              type="text"
              name="materia"
              value={teleclase.materia}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              type="text"
              name="descripcion"
              value={teleclase.descripcion}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Video Actual</Form.Label>
            {teleclase.videoUrl && (
              <div className="mb-2">
                <video 
                  src={teleclase.videoUrl} 
                  style={{ width: '100%', maxHeight: '200px' }} 
                  controls
                />
              </div>
            )}
            <Form.Label>Cambiar Video (opcional)</Form.Label>
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
        <Button variant="primary" onClick={handleEditTeleclase}>
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionTeleclases;

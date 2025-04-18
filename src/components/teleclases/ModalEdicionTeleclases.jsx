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
        <Modal.Title className="modal-title-custom">Editar Teleclase</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Título</Form.Label>
            <Form.Control
              type="text"
              name="titulo"
              value={teleclase.titulo}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Materia</Form.Label>
            <Form.Select
              name="materia"
              value={teleclase.materia}
              onChange={handleInputChange}
              className="form-control-custom"
            >
              <option value="">Selecciona una materia</option>
              <option value="Matematica">Matemática</option>
              <option value="Lengua y literatura">Lengua y Literatura</option>
              <option value="Ciencias naturales">Ciencias Naturales</option>
              <option value="Estudios sociales">Estudios Sociales</option>
              <option value="Inglés">Inglés</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Descripción</Form.Label>
            <Form.Control
              type="text"
              name="descripcion"
              value={teleclase.descripcion}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Video Actual</Form.Label>
            {teleclase.videoUrl && (
              <div className="mb-2">
                <video 
                  src={teleclase.videoUrl} 
                  style={{ width: '100%', maxHeight: '200px' }} 
                  controls
                />
              </div>
            )}
            <Form.Label className="form-label-custom">Cambiar Video (opcional)</Form.Label>
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
        <Button className="btn-style" onClick={handleEditTeleclase}>
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionTeleclases;

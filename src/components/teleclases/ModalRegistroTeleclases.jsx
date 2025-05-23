import React from "react";
import { Modal, Form, Button } from "react-bootstrap";
import ReactGA from "react-ga4";

ReactGA.initialize([
  {
    trackingId: "G-7VB065E7DH",
    gaOptions: {
      siteSpeedSampleRate: 100
    }
  }
]);

const ModalRegistroTeleclases = ({
  showModal,
  setShowModal,
  nuevaTeleclase,
  handleInputChange,
  handleVideoChange,
  handleAddTeleclase,
}) => {
  // Función para rastrear el registro de teleclases
  const trackTeleclaseRegistration = () => {
    ReactGA.event({
      category: "Teleclases",
      action: "Registro",
      label: nuevaTeleclase.titulo,
      origin: "registroteleclases"
    });
  };

  // Modificar handleAddTeleclase para incluir el tracking
  const handleAddTeleclaseWithTracking = () => {
    handleAddTeleclase();
    trackTeleclaseRegistration();
  };

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
            <Form.Select
              name="materia"
              value={nuevaTeleclase.materia}
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
        <Button className="btn-style" onClick={handleAddTeleclaseWithTracking}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroTeleclases;

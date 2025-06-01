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

const ModalEdicionTeleclases = ({
  showModal,
  setShowModal,
  teleclase,
  handleInputChange,
  handleVideoChange,
  handleEditTeleclase,
}) => {
  if (!teleclase) return null;

  const trackTeleclaseUpdate = () => {
    ReactGA.event({
      category: "Teleclases",
      action: "Actualización",
      label: teleclase.titulo,
      origin: "registroteleclases"
    });
  };

  const handleEditTeleclaseWithTracking = () => {
    handleEditTeleclase();
    trackTeleclaseUpdate();
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">Editar Teleclase</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="titulo" className="form-label-custom">Título</Form.Label>
            <Form.Control
              id="titulo"
              type="text"
              name="titulo"
              value={teleclase.titulo}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="materia" className="form-label-custom">Materia</Form.Label>
            <Form.Select
              id="materia"
              name="materia"
              value={teleclase.materia}
              onChange={handleInputChange}
              className="form-control-custom"
            >
              <option value="">Selecciona una materia</option>
              <option value="Matemática">Matemática</option>
              <option value="Lengua y literatura">Lengua y Literatura</option>
              <option value="Ciencias naturales">Ciencias Naturales</option>
              <option value="Estudios sociales">Estudios Sociales</option>
              <option value="Inglés">Inglés</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="descripcion" className="form-label-custom">Descripción</Form.Label>
            <Form.Control
              id="descripcion"
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
            <Form.Label htmlFor="video" className="form-label-custom">Cambiar Video (opcional)</Form.Label>
            <Form.Control
              id="video"
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
        <Button className="btn-style" onClick={handleEditTeleclaseWithTracking}>
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionTeleclases;

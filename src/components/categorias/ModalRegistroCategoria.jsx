import React from "react";
import { Modal, Form, Button } from "react-bootstrap";
import ReactGA from "react-ga4";

ReactGA.initialize([
  {
    trackingId: "G-7VB065E7DH",
    gaOptions: {
      siteSpeedSampleRate: 100,
    },
  },
]);

const ModalRegistroCategoria = ({
  showModal,
  setShowModal,
  nuevaCategoria,
  handleInputChange,
  handleAddCategoria,
}) => {
  // Función para rastrear el registro de categoría
  const trackCategoriaRegistration = () => {
    ReactGA.event({
      category: "Categorías",
      action: "Registro",
      label: nuevaCategoria.nombre,
      origin: "registroteleclases",
    });
  };

  // Modificar handleAddCategoria para incluir el tracking
  const handleAddCategoriaWithTracking = () => {
    handleAddCategoria();
    trackCategoriaRegistration();
  };

  return (
    <Modal
      show={showModal}
      onHide={() => setShowModal(false)}
      centered
      className="modal-categoria"
    >
      <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">
          Nueva Categoría
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label
              htmlFor="categoria-nombre"
              className="form-label-custom"
            >
              Nombre
            </Form.Label>
            <Form.Control
              id="categoria-nombre"
              type="text"
              name="nombre"
              value={nuevaCategoria.nombre}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre"
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label
              htmlFor="categoria-descripcion"
              className="form-label-custom"
            >
              Descripción
            </Form.Label>
            <Form.Control
              id="categoria-descripcion"
              as="textarea"
              rows={3}
              name="descripcion"
              value={nuevaCategoria.descripcion}
              onChange={handleInputChange}
              placeholder="Ingresa la descripción"
              className="form-control-custom"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </Button>
        <Button className="btn-style" onClick={handleAddCategoriaWithTracking}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCategoria;

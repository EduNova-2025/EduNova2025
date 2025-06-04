import React, { useState } from "react";
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
  const [error, setError] = useState('');

  // Función para validar la categoría
  const validarCategoria = () => {
    if (!nuevaCategoria.nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (nuevaCategoria.nombre.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return false;
    }
    if (!nuevaCategoria.descripcion.trim()) {
      setError('La descripción es requerida');
      return false;
    }
    if (nuevaCategoria.descripcion.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return false;
    }
    return true;
  };

  // Función para rastrear el registro de categoría
  const trackCategoriaRegistration = () => {
    ReactGA.event({
      category: "Categorías",
      action: "Registro",
      label: nuevaCategoria.nombre,
      origin: "registroteleclases",
    });
  };

  // Modificar handleAddCategoria para incluir el tracking y validación
  const handleAddCategoriaWithTracking = () => {
    setError('');
    if (validarCategoria()) {
      handleAddCategoria();
      trackCategoriaRegistration();
    }
  };

  return (
    <Modal
      show={showModal}
      onHide={() => {
        setShowModal(false);
        setError('');
      }}
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
              className="modal-label-custom"
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
              className="text-danger"
              required
            />
            <small className="text-danger">Ingrese un nombre descriptivo (mínimo 3 caracteres)</small>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label
              htmlFor="categoria-descripcion"
              className="modal-label-custom"
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
              className="text-danger"
              required
            />
            <small className="text-danger">Describa la categoría (mínimo 10 caracteres)</small>
          </Form.Group>
          {error && <div className="text-danger mb-3">{error}</div>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => {
          setShowModal(false);
          setError('');
        }}>
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

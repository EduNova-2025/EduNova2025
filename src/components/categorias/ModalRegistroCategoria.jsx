import React, { useState, useEffect } from "react";
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
  const [errores, setErrores] = useState({
    nombre: true,
    descripcion: true
  });
  const [formularioValido, setFormularioValido] = useState(false);

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'nombre':
        return valor.trim().length >= 3;
      case 'descripcion':
        return valor.trim().length >= 10;
      default:
        return true;
    }
  };

  const handleInputChangeWithValidation = (e) => {
    const { name, value } = e.target;
    handleInputChange(e);
    const esValido = validarCampo(name, value);
    setErrores(prev => ({ ...prev, [name]: !esValido }));
  };

  useEffect(() => {
    const todosLosCamposValidos = Object.keys(errores).every(campo => !errores[campo]);
    const todosLosCamposLlenos = Object.keys(nuevaCategoria).every(campo => 
      nuevaCategoria[campo] && nuevaCategoria[campo].trim() !== ''
    );
    setFormularioValido(todosLosCamposValidos && todosLosCamposLlenos);
  }, [errores, nuevaCategoria]);

  const trackCategoriaRegistration = () => {
    ReactGA.event({
      category: "Categorías",
      action: "Registro",
      label: nuevaCategoria.nombre,
      origin: "registroteleclases",
    });
  };

  const handleAddCategoriaWithTracking = () => {
    if (formularioValido) {
      handleAddCategoria();
      trackCategoriaRegistration();
    }
  };

  return (
    <Modal
      show={showModal}
      onHide={() => {
        setShowModal(false);
        setErrores({
          nombre: true,
          descripcion: true
        });
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
              onChange={handleInputChangeWithValidation}
              placeholder="Ingresa el nombre"
              className={errores.nombre ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Ingrese un nombre descriptivo (mínimo 3 caracteres)</small>
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
              onChange={handleInputChangeWithValidation}
              placeholder="Ingresa la descripción"
              className={errores.descripcion ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Describa la categoría (mínimo 10 caracteres)</small>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => {
          setShowModal(false);
          setErrores({
            nombre: true,
            descripcion: true
          });
        }}>
          Cancelar
        </Button>
        <Button 
          className="btn-style" 
          onClick={handleAddCategoriaWithTracking}
          disabled={!formularioValido}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCategoria;

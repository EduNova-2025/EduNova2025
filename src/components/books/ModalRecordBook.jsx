import React from "react";
import { Modal, Form, Button } from "react-bootstrap";
import ReactGA from "react-ga4";

ReactGA.initialize([
  {
    trackingId: "G-71KQ8LCBB0",
    gaOptions: {
      siteSpeedSampleRate: 100
    }
  }
]);

const ModalRegistroLibro = ({
showModal,
setShowModal,
nuevoLibro,
handleInputChange,
handleImageChange,
handlePdfChange,
handleAddLibro,
categorias
}) => {

  // Función para rastrear el registro de libro
  const trackLibroRegistration = () => {
    ReactGA.event({
      category: "Libros",
      action: "Registro",
      label: nuevoLibro.titulo,
      origin: "registroteleclases"
    });
  };

  // Modificar handleAddLibro para incluir el tracking
  const handleAddLibroWithTracking = () => {
    handleAddLibro();
    trackLibroRegistration();
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">Agregar Libro</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Titulo</Form.Label>
            <Form.Control
            type="text"
            name="titulo"
            value={nuevoLibro.titulo}
            onChange={handleInputChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Descripción</Form.Label>
            <Form.Control
            type="text"
            name="descripcion"
            value={nuevoLibro.descripcion}
            onChange={handleInputChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Edicion</Form.Label>
            <Form.Control
            type="text"
            name="edicion"
            value={nuevoLibro.edicion}
            onChange={handleInputChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Área Educativa</Form.Label>
            <Form.Control
            type="text"
            name="area_edu"
            value={nuevoLibro.area_edu}
            onChange={handleInputChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Dirigido a</Form.Label>
            <Form.Control
            type="text"
            name="dirigido"
            value={nuevoLibro.dirigido}
            onChange={handleInputChange}
            className="form-control-custom"
            />
        <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Categoría</Form.Label>
                <Form.Select
                name="categoria"
                value={nuevoLibro.categoria}
                onChange={handleInputChange}
                className="form-control-custom"
                >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                    </option>
                ))}
                </Form.Select>
            </Form.Group>
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Imagen</Form.Label>
            <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Documento PDF</Form.Label>
            <Form.Control
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            className="form-control-custom"
            />
        </Form.Group>
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
        Cancelar
        </Button>
        <Button className="btn-style" onClick={handleAddLibroWithTracking}>
        Guardar
        </Button>
    </Modal.Footer>
    </Modal>
);
};

export default ModalRegistroLibro;
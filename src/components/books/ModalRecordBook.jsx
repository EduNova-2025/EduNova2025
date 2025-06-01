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

  const trackLibroRegistration = () => {
    ReactGA.event({
      category: "Libros",
      action: "Registro",
      label: nuevoLibro.titulo,
      origin: "registroteleclases"
    });
  };

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
            <Form.Label htmlFor="titulo" className="form-label-custom">Titulo</Form.Label>
            <Form.Control
              id="titulo"
              type="text"
              name="titulo"
              value={nuevoLibro.titulo}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="descripcion" className="form-label-custom">Descripción</Form.Label>
            <Form.Control
              id="descripcion"
              type="text"
              name="descripcion"
              value={nuevoLibro.descripcion}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="edicion" className="form-label-custom">Edicion</Form.Label>
            <Form.Control
              id="edicion"
              type="text"
              name="edicion"
              value={nuevoLibro.edicion}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="area_edu" className="form-label-custom">Área Educativa</Form.Label>
            <Form.Control
              id="area_edu"
              type="text"
              name="area_edu"
              value={nuevoLibro.area_edu}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dirigido" className="form-label-custom">Dirigido a</Form.Label>
            <Form.Control
              id="dirigido"
              type="text"
              name="dirigido"
              value={nuevoLibro.dirigido}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="categoria" className="form-label-custom">Categoría</Form.Label>
            <Form.Select
              id="categoria"
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
          <Form.Group className="mb-3">
            <Form.Label htmlFor="imagen" className="form-label-custom">Imagen</Form.Label>
            <Form.Control
              id="imagen"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="pdf" className="form-label-custom">Documento PDF</Form.Label>
            <Form.Control
              id="pdf"
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

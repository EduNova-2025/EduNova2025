import React, { useState } from "react";
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
  const [error, setError] = useState('');

  const validarLibro = () => {
    if (!nuevoLibro.titulo.trim()) {
      setError('El título es requerido');
      return false;
    }
    if (nuevoLibro.titulo.length < 3) {
      setError('El título debe tener al menos 3 caracteres');
      return false;
    }
    if (!nuevoLibro.descripcion.trim()) {
      setError('La descripción es requerida');
      return false;
    }
    if (nuevoLibro.descripcion.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return false;
    }
    if (!nuevoLibro.edicion.trim()) {
      setError('La edición es requerida');
      return false;
    }
    if (!nuevoLibro.area_edu.trim()) {
      setError('El área educativa es requerida');
      return false;
    }
    if (!nuevoLibro.dirigido.trim()) {
      setError('El campo "Dirigido a" es requerido');
      return false;
    }
    if (!nuevoLibro.categoria) {
      setError('Debe seleccionar una categoría');
      return false;
    }
    if (!nuevoLibro.imagen) {
      setError('Debe seleccionar una imagen');
      return false;
    }
    // Validar formato de imagen
    if (nuevoLibro.imagen && !nuevoLibro.imagen.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return false;
    }
    // Validar tamaño de imagen (máximo 5MB)
    if (nuevoLibro.imagen && nuevoLibro.imagen.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return false;
    }
    if (!nuevoLibro.pdf) {
      setError('Debe seleccionar un archivo PDF');
      return false;
    }
    // Validar formato del PDF
    if (nuevoLibro.pdf && !nuevoLibro.pdf.type.includes('pdf')) {
      setError('El archivo debe ser un PDF');
      return false;
    }
    // Validar tamaño del PDF (máximo 50MB)
    if (nuevoLibro.pdf && nuevoLibro.pdf.size > 50 * 1024 * 1024) {
      setError('El PDF no debe superar los 50MB');
      return false;
    }
    return true;
  };

  const trackLibroRegistration = () => {
    ReactGA.event({
      category: "Libros",
      action: "Registro",
      label: nuevoLibro.titulo,
      origin: "registroteleclases"
    });
  };

  const handleAddLibroWithTracking = () => {
    setError('');
    if (validarLibro()) {
      handleAddLibro();
      trackLibroRegistration();
    }
  };

  return (
    <Modal show={showModal} onHide={() => {
      setShowModal(false);
      setError('');
    }}>
      <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">Agregar Libro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="titulo" className="modal-label-custom">Título</Form.Label>
            <Form.Control
              id="titulo"
              type="text"
              name="titulo"
              value={nuevoLibro.titulo}
              onChange={handleInputChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Ingrese el título del libro (mínimo 3 caracteres)</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="descripcion" className="modal-label-custom">Descripción</Form.Label>
            <Form.Control
              id="descripcion"
              type="text"
              name="descripcion"
              value={nuevoLibro.descripcion}
              onChange={handleInputChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Describa el contenido del libro (mínimo 10 caracteres)</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="edicion" className="modal-label-custom">Edición</Form.Label>
            <Form.Control
              id="edicion"
              type="text"
              name="edicion"
              value={nuevoLibro.edicion}
              onChange={handleInputChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Ingrese la edición del libro</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="area_edu" className="modal-label-custom">Área Educativa</Form.Label>
            <Form.Control
              id="area_edu"
              type="text"
              name="area_edu"
              value={nuevoLibro.area_edu}
              onChange={handleInputChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Ingrese el área educativa</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dirigido" className="modal-label-custom">Dirigido a</Form.Label>
            <Form.Control
              id="dirigido"
              type="text"
              name="dirigido"
              value={nuevoLibro.dirigido}
              onChange={handleInputChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Especifique a quién está dirigido el libro</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="categoria" className="modal-label-custom">Categoría</Form.Label>
            <Form.Select
              id="categoria"
              name="categoria"
              value={nuevoLibro.categoria}
              onChange={handleInputChange}
              className="text-danger"
              required
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </Form.Select>
            <small className="text-danger">Seleccione la categoría correspondiente</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="imagen" className="modal-label-custom">Imagen</Form.Label>
            <Form.Control
              id="imagen"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Seleccione una imagen (máximo 5MB)</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="pdf" className="modal-label-custom">Documento PDF</Form.Label>
            <Form.Control
              id="pdf"
              type="file"
              accept="application/pdf"
              onChange={handlePdfChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Seleccione un archivo PDF (máximo 50MB)</small>
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
        <Button className="btn-style" onClick={handleAddLibroWithTracking}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroLibro;
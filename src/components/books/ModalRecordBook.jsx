import React, { useState, useEffect } from "react";
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
  const [errores, setErrores] = useState({
    titulo: true,
    descripcion: true,
    edicion: true,
    area_edu: true,
    dirigido: true,
    categoria: true,
    imagen: true,
    pdf: true
  });
  const [formularioValido, setFormularioValido] = useState(false);

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'titulo':
        return valor.trim().length >= 3;
      case 'descripcion':
        return valor.trim().length >= 10;
      case 'edicion':
        return valor.trim() !== '';
      case 'area_edu':
        return valor.trim() !== '';
      case 'dirigido':
        return valor.trim() !== '';
      case 'categoria':
        return valor !== '';
      case 'imagen':
        if (!valor) return false;
        if (!valor.type.startsWith('image/')) return false;
        if (valor.size > 5 * 1024 * 1024) return false;
        return true;
      case 'pdf':
        if (!valor) return false;
        if (!valor.type.includes('pdf')) return false;
        if (valor.size > 50 * 1024 * 1024) return false;
        return true;
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

  const handleImageChangeWithValidation = (e) => {
    handleImageChange(e);
    const archivo = e.target.files[0];
    const esValido = validarCampo('imagen', archivo);
    setErrores(prev => ({ ...prev, imagen: !esValido }));
  };

  const handlePdfChangeWithValidation = (e) => {
    handlePdfChange(e);
    const archivo = e.target.files[0];
    const esValido = validarCampo('pdf', archivo);
    setErrores(prev => ({ ...prev, pdf: !esValido }));
  };

  useEffect(() => {
    const todosLosCamposValidos = Object.keys(errores).every(campo => !errores[campo]);
    const todosLosCamposLlenos = Object.keys(nuevoLibro).every(campo => 
      nuevoLibro[campo] && nuevoLibro[campo].trim() !== ''
    );
    setFormularioValido(todosLosCamposValidos && todosLosCamposLlenos);
  }, [errores, nuevoLibro]);

  const trackLibroRegistration = () => {
    ReactGA.event({
      category: "Libros",
      action: "Registro",
      label: nuevoLibro.titulo,
      origin: "registroteleclases"
    });
  };

  const handleAddLibroWithTracking = () => {
    if (formularioValido) {
      handleAddLibro();
      trackLibroRegistration();
    }
  };

  return (
    <Modal show={showModal} onHide={() => {
      setShowModal(false);
      setErrores({
        titulo: true,
        descripcion: true,
        edicion: true,
        area_edu: true,
        dirigido: true,
        categoria: true,
        imagen: true,
        pdf: true
      });
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
              onChange={handleInputChangeWithValidation}
              className={errores.titulo ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Ingrese el título del libro (mínimo 3 caracteres)</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="descripcion" className="modal-label-custom">Descripción</Form.Label>
            <Form.Control
              id="descripcion"
              type="text"
              name="descripcion"
              value={nuevoLibro.descripcion}
              onChange={handleInputChangeWithValidation}
              className={errores.descripcion ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Describa el contenido del libro (mínimo 10 caracteres)</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="edicion" className="modal-label-custom">Edición</Form.Label>
            <Form.Control
              id="edicion"
              type="text"
              name="edicion"
              value={nuevoLibro.edicion}
              onChange={handleInputChangeWithValidation}
              className={errores.edicion ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Ingrese la edición del libro</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="area_edu" className="modal-label-custom">Área Educativa</Form.Label>
            <Form.Control
              id="area_edu"
              type="text"
              name="area_edu"
              value={nuevoLibro.area_edu}
              onChange={handleInputChangeWithValidation}
              className={errores.area_edu ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Ingrese el área educativa</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dirigido" className="modal-label-custom">Dirigido a</Form.Label>
            <Form.Control
              id="dirigido"
              type="text"
              name="dirigido"
              value={nuevoLibro.dirigido}
              onChange={handleInputChangeWithValidation}
              className={errores.dirigido ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Especifique a quién está dirigido el libro</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="categoria" className="modal-label-custom">Categoría</Form.Label>
            <Form.Select
              id="categoria"
              name="categoria"
              value={nuevoLibro.categoria}
              onChange={handleInputChangeWithValidation}
              className={errores.categoria ? 'input-error' : ''}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </Form.Select>
            <small className="text-muted">Seleccione la categoría correspondiente</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="imagen" className="modal-label-custom">Imagen</Form.Label>
            <Form.Control
              id="imagen"
              type="file"
              accept="image/*"
              onChange={handleImageChangeWithValidation}
              className={errores.imagen ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Seleccione una imagen (máximo 5MB)</small>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="pdf" className="modal-label-custom">Documento PDF</Form.Label>
            <Form.Control
              id="pdf"
              type="file"
              accept="application/pdf"
              onChange={handlePdfChangeWithValidation}
              className={errores.pdf ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Seleccione un archivo PDF (máximo 50MB)</small>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => {
          setShowModal(false);
          setErrores({
            titulo: true,
            descripcion: true,
            edicion: true,
            area_edu: true,
            dirigido: true,
            categoria: true,
            imagen: true,
            pdf: true
          });
        }}>
          Cancelar
        </Button>
        <Button 
          className="btn-style" 
          onClick={handleAddLibroWithTracking}
          disabled={!formularioValido}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroLibro;
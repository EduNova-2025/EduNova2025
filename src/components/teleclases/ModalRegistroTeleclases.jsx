import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [error, setError] = useState('');

  // Función para rastrear el registro de teleclases
  const trackTeleclaseRegistration = () => {
    ReactGA.event({
      category: "Teleclases",
      action: "Registro",
      label: nuevaTeleclase.titulo,
      origin: "registroteleclases"
    });
  };

  const validarTeleclase = () => {
    if (!nuevaTeleclase.titulo.trim()) {
      setError('El título es requerido');
      return false;
    }
    if (nuevaTeleclase.titulo.length < 3) {
      setError('El título debe tener al menos 3 caracteres');
      return false;
    }
    if (!nuevaTeleclase.materia) {
      setError('Debe seleccionar una materia');
      return false;
    }
    if (!nuevaTeleclase.descripcion.trim()) {
      setError('La descripción es requerida');
      return false;
    }
    if (nuevaTeleclase.descripcion.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return false;
    }
    if (!nuevaTeleclase.video) {
      setError('Debe seleccionar un video');
      return false;
    }
    // Validar formato del video
    if (nuevaTeleclase.video && !nuevaTeleclase.video.type.startsWith('video/')) {
      setError('El archivo debe ser un video');
      return false;
    }
    // Validar tamaño del video (máximo 100MB)
    if (nuevaTeleclase.video && nuevaTeleclase.video.size > 100 * 1024 * 1024) {
      setError('El video no debe superar los 100MB');
      return false;
    }
    return true;
  };

  const handleAddTeleclaseWithTracking = () => {
    setError('');
    if (validarTeleclase()) {
      handleAddTeleclase();
      trackTeleclaseRegistration();
    }
  };

  return (
    <Modal show={showModal} onHide={() => {
      setShowModal(false);
      setError('');
    }}>
      <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">{t('teleclase.agregarTeleclase')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label-custom">{t('teleclase.titulo')}</Form.Label>
            <Form.Control
              type="text"
              name="titulo"
              placeholder={t('teleclase.agregarTitulo')}
              value={nuevaTeleclase.titulo}
              onChange={handleInputChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Ingrese un título descriptivo (mínimo 3 caracteres)</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="materia" className="modal-label-custom">{t('teleclase.materia')}</Form.Label>
            <Form.Select
              id="materia"
              value={nuevaTeleclase.materia}
              onChange={handleInputChange}
              className="modal-select-custom"
              required
            >
              <option value="">{t('teleclase.seleccionarMateria')}</option>
              <option value="Matematica">{t('teleclase.matematica')}</option>
              <option value="Lengua y literatura">{t('teleclase.lengua')}</option>
              <option value="Ciencias naturales">{t('teleclase.ciencias')}</option>
              <option value="Estudios sociales">{t('teleclase.estudiosSociales')}</option>
              <option value="Inglés">{t('teleclase.ingles')}</option>
            </Form.Select>
            <small className="text-danger">Seleccione la materia correspondiente</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="modal-label-custom">{t('teleclase.descripcion')}</Form.Label>
            <Form.Control
              type="text"
              name="descripcion"
              placeholder={t('teleclase.escribirDescripcion')}
              value={nuevaTeleclase.descripcion}
              onChange={handleInputChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Describa el contenido de la teleclase (mínimo 10 caracteres)</small>
          </Form.Group>

          <Form.Group className="mb-3">
          <Form.Label className="modal-label-custom">{t('teleclase.archivoVideo')}</Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="text-danger"
              required
            />
            <small className="text-danger">Seleccione un video (máximo 100MB)</small>
          </Form.Group>

          {error && <div className="text-danger mb-3">{error}</div>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => {
          setShowModal(false);
          setError('');
        }}>
          {t('common.cancelar')}
        </Button>
        <Button className="btn-style" onClick={handleAddTeleclaseWithTracking}>
          {t('common.guardar')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroTeleclases;

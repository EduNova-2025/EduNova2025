import React from "react";
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
        <Modal.Title className="modal-title-custom">{t('teleclase.agregarTeleclase')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">{t('teleclase.titulo')}</Form.Label>
            <Form.Control
              type="text"
              name="titulo"
              placeholder={t('teleclase.agregarTitulo')}
              value={nuevaTeleclase.titulo}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="materia" className="form-label-custom">{t('teleclase.materia')}</Form.Label>
            <Form.Select
              id="materia"
              value={nuevaTeleclase.materia}
              onChange={handleInputChange}
              className="form-control-custom"
            >
              <option value="">{t('teleclase.seleccionarMateria')}</option>
              <option value="Matematica">{t('teleclase.matematica')}</option>
              <option value="Lengua y literatura">{t('teleclase.lengua')}</option>
              <option value="Ciencias naturales">{t('teleclase.ciencias')}</option>
              <option value="Estudios sociales">{t('teleclase.estudiosSociales')}</option>
              <option value="Inglés">{t('teleclase.ingles')}</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">{t('teleclase.descripcion')}</Form.Label>
            <Form.Control
              type="text"
              name="descripcion"
              placeholder={t('teleclase.escribirDescripcion')}
              value={nuevaTeleclase.descripcion}
              onChange={handleInputChange}
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">{t('teleclase.archivoVideo')}</Form.Label>
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

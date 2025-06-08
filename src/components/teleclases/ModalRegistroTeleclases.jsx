import React, { useState, useEffect } from "react";
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
  const [errores, setErrores] = useState({
    titulo: true,
    materia: true,
    descripcion: true,
    video: true
  });
  const [formularioValido, setFormularioValido] = useState(false);

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'titulo':
        return valor.trim().length >= 3;
      case 'materia':
        return valor !== '';
      case 'descripcion':
        return valor.trim().length >= 10;
      case 'video':
        if (!valor) return false;
        if (!valor.type.startsWith('video/')) return false;
        if (valor.size > 100 * 1024 * 1024) return false;
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

  const handleVideoChangeWithValidation = (e) => {
    handleVideoChange(e);
    const archivo = e.target.files[0];
    const esValido = validarCampo('video', archivo);
    setErrores(prev => ({ ...prev, video: !esValido }));
  };

  useEffect(() => {
    const todosLosCamposValidos = Object.keys(errores).every(campo => !errores[campo]);
    const todosLosCamposLlenos = Object.keys(nuevaTeleclase).every(campo => 
      nuevaTeleclase[campo] && nuevaTeleclase[campo].trim() !== ''
    );
    setFormularioValido(todosLosCamposValidos && todosLosCamposLlenos);
  }, [errores, nuevaTeleclase]);

  const trackTeleclaseRegistration = () => {
    ReactGA.event({
      category: "Teleclases",
      action: "Registro",
      label: nuevaTeleclase.titulo,
      origin: "registroteleclases"
    });
  };

  const handleAddTeleclaseWithTracking = () => {
    if (formularioValido) {
      handleAddTeleclase();
      trackTeleclaseRegistration();
    }
  };

  return (
    <Modal show={showModal} onHide={() => {
      setShowModal(false);
      setErrores({
        titulo: true,
        materia: true,
        descripcion: true,
        video: true
      });
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
              onChange={handleInputChangeWithValidation}
              className={errores.titulo ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Ingrese un título descriptivo (mínimo 3 caracteres)</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="materia" className="modal-label-custom">{t('teleclase.materia')}</Form.Label>
            <Form.Select
              id="materia"
              name="materia"
              value={nuevaTeleclase.materia}
              onChange={handleInputChangeWithValidation}
              className={`modal-select-custom ${errores.materia ? 'input-error' : ''}`}
              required
            >
              <option value="">{t('teleclase.seleccionarMateria')}</option>
              <option value="Matematica">{t('teleclase.matematica')}</option>
              <option value="Lengua y literatura">{t('teleclase.lengua')}</option>
              <option value="Ciencias naturales">{t('teleclase.ciencias')}</option>
              <option value="Estudios sociales">{t('teleclase.estudiosSociales')}</option>
              <option value="Inglés">{t('teleclase.ingles')}</option>
            </Form.Select>
            <small className="text-muted">Seleccione la materia correspondiente</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="modal-label-custom">{t('teleclase.descripcion')}</Form.Label>
            <Form.Control
              type="text"
              name="descripcion"
              placeholder={t('teleclase.escribirDescripcion')}
              value={nuevaTeleclase.descripcion}
              onChange={handleInputChangeWithValidation}
              className={errores.descripcion ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Describa el contenido de la teleclase (mínimo 10 caracteres)</small>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="modal-label-custom">{t('teleclase.archivoVideo')}</Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={handleVideoChangeWithValidation}
              className={errores.video ? 'input-error' : ''}
              required
            />
            <small className="text-muted">Seleccione un video (máximo 100MB)</small>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => {
          setShowModal(false);
          setErrores({
            titulo: true,
            materia: true,
            descripcion: true,
            video: true
          });
        }}>
          {t('common.cancelar')}
        </Button>
        <Button 
          className="btn-style" 
          onClick={handleAddTeleclaseWithTracking}
          disabled={!formularioValido}
        >
          {t('common.guardar')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroTeleclases;

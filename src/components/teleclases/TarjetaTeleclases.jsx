import React from 'react';
import { Card, Col } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ReactGA from 'react-ga4';

const TarjetaTeleclases = ({ teleclase, onShowQR }) => {
  const handleVideoPlay = () => {
    ReactGA.event({
      category: teleclase.materia || 'Sin materia',
      action: 'Reproducir Video Teleclase',
      label: teleclase.titulo
    });
  };

  return (
    <Col lg={4} md={6} sm={12} className="mb-4">
      <Card className="tarjeta-teleclase">
        {teleclase.videoUrl && (
          <div className="video-container">
            <video 
              className="card-img-top" 
              src={teleclase.videoUrl} 
              controls
              onPlay={handleVideoPlay}
            />
          </div>
        )}
        <Card.Body>
          <div className="tarjeta-contenido">
            <h3 className="tarjeta-titulo">
              Teleclases - {teleclase.materia}
            </h3>
            <p className="tarjeta-descripcion">{teleclase.descripcion}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                className="btn btn-outline-primary"
                onClick={() => onShowQR(teleclase.videoUrl)}
              >
                <i className="bi bi-qr-code"></i> Compartir QR
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default TarjetaTeleclases;

/* <Button
variant="outline-warning"
size="sm"
className="me-2"
onClick={() => openEditModal(teleclase)}
>
<i className="bi bi-pencil"></i> Editar
</Button> */
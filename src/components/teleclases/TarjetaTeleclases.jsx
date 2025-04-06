import React from 'react';
import { Card, Col } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TarjetaTeleclases = ({ teleclase }) => {
  return (
    <Col lg={4} md={6} sm={12} className="mb-4">
      <Card className="tarjeta-teleclase">
        {teleclase.videoUrl && (
          <div className="video-container">
            <video 
              className="card-img-top" 
              src={teleclase.videoUrl} 
              controls
            />
          </div>
        )}
        <Card.Body>
        <div className="tarjeta-contenido">
            <h3 className="tarjeta-titulo">
              Teleclases - {teleclase.materia}
            </h3>
            <p className="tarjeta-descripcion">{teleclase.descripcion}</p>
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
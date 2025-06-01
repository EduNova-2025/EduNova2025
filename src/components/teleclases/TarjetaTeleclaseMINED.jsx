import React from 'react';
import { Card, Col, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TarjetaTeleclasesMINED = ({ teleclase, onEdit, onDelete }) => {
  return (
    <Col lg={4} md={6} sm={12} className="mb-4">
      <Card className="tarjeta-teleclase">
        {teleclase.videoUrl && (
          <div className="video-container">
            <video 
              className="card-img-top" 
              src={teleclase.videoUrl} 
              controls 
              role="video"
            />
          </div>
        )}
        <Card.Body>
          <div className="tarjeta-contenido">
            <h3 className="tarjeta-titulo">
              {teleclase.titulo} - {teleclase.materia}
            </h3>
            <p className="tarjeta-descripcion">{teleclase.descripcion}</p>
            <div className="tarjeta-acciones">
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="btn-accion"
                onClick={onEdit}
                aria-label="Editar teleclase"
              >
                <i className="bi bi-pencil-fill"></i>
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="btn-accion"
                onClick={onDelete}
                aria-label="Eliminar teleclase"
              >
                <i className="bi bi-trash-fill"></i>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default TarjetaTeleclasesMINED;

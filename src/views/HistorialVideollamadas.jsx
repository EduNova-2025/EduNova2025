import React, { useState, useEffect } from 'react';
import { db } from '../database/firebaseconfig';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import CuadroBusquedas from '../components/busquedas/CuadroBusquedas';
import { Card, Button, Row, Col, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../styles/Conferencias.css';

const HistorialVideollamadas = () => {
  const { t } = useTranslation();
  const [videollamadas, setVideollamadas] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'videoconferencias'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const llamadas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVideollamadas(llamadas);
    });
    return () => unsubscribe();
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const filteredCalls = videollamadas.filter((call) =>
    call.roomName.toLowerCase().includes(searchText) ||
    call.displayName.toLowerCase().includes(searchText) ||
    call.plataforma.toLowerCase().includes(searchText)
  );

  return (
    <Container className="historial-videollamadas-container mt-4">
      <h2 className="mb-4" style={{ fontWeight: 700 }}>{t('historialVideollamadas.titulo')}</h2>
      <Row className="mb-4">
        <Col md={6} sm={12} className="mb-2">
          <input
            type="text"
            className="form-control historial-search-input"
            placeholder={t('historialVideollamadas.buscarPlaceholder') || 'Buscar...'}
            value={searchText}
            onChange={handleSearchChange}
            style={{ borderRadius: 8, border: '2px solid #e83e8c', fontSize: 18, padding: '10px 16px' }}
          />
        </Col>
      </Row>
      <Row className="g-4">
        {filteredCalls.length === 0 ? (
          <Col xs={12}>
            <Card className="text-center p-4 shadow-sm">
              <Card.Body>
                <p className="mb-0">No se encontraron videollamadas.</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredCalls.map((call) => (
            <Col key={call.id} xs={12} md={6} lg={4}>
              <Card className="mb-3 shadow historial-card">
                <Card.Body>
                  <Card.Title style={{ fontWeight: 600, fontSize: 20 }}>{call.roomName}</Card.Title>
                  <div style={{ marginBottom: 8 }}>
                    <span className="fw-semibold">Docente:</span> {call.displayName}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span className="fw-semibold">Plataforma:</span> {call.plataforma}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span className="fw-semibold">Fecha:</span> {call.fecha?.toDate ? call.fecha.toDate().toLocaleString() : ''}
                  </div>
                  {call.enlace && (
                    <Button
                      variant="primary"
                      href={call.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2"
                    >
                      Ir a llamada
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default HistorialVideollamadas;

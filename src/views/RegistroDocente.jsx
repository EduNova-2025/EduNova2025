import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../database/authcontext";

const RegistroDocente = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: user?.email || "",
        especialidad: "",
        institucion: "",
        telefono: "",
        direccion: "",
        experiencia: "",
        educacion: "",
        certificaciones: ""
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.apellido || !formData.email) {
            setError(t('registroDocente.camposRequeridos'));
            return;
        }

        try {
            await addDoc(collection(db, "docentes"), {
                ...formData,
                fechaRegistro: new Date().toISOString(),
                estado: "pendiente"
            });
            setSuccess(true);
            setError(null);
            setFormData({
                nombre: "",
                apellido: "",
                email: user?.email || "",
                especialidad: "",
                institucion: "",
                telefono: "",
                direccion: "",
                experiencia: "",
                educacion: "",
                certificaciones: ""
            });
        } catch (error) {
            console.error("Error al registrar docente:", error);
            setError(t('registroDocente.errorRegistro'));
        }
    };

    return (
        <Container className="mt-4">
            <h4 className="title-gestion">{t('registroDocente.titulo')}</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{t('registroDocente.registroExitoso')}</div>}

            <Card>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('registroDocente.nombre')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('registroDocente.apellido')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('registroDocente.email')}</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('registroDocente.especialidad')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="especialidad"
                                        value={formData.especialidad}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('registroDocente.institucion')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="institucion"
                                        value={formData.institucion}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('registroDocente.telefono')}</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('registroDocente.direccion')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('registroDocente.experiencia')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="experiencia"
                                value={formData.experiencia}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('registroDocente.educacion')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="educacion"
                                value={formData.educacion}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('registroDocente.certificaciones')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="certificaciones"
                                value={formData.certificaciones}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Button type="submit" variant="primary">
                            {t('registroDocente.registrar')}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RegistroDocente;

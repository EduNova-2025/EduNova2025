import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { registrarUsuario } from '../components/registro/RegistroUsuario';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../database/firebaseconfig';
import { useNavigate } from 'react-router-dom';  // Importar useNavigate
import '../styles/RegistroDocente.css';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../database/authcontext";

const RegistroGestor = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: user?.email || "",
        institucion: "",
        cargo: "",
        telefono: "",
        direccion: "",
        experiencia: "",
        educacion: "",
        certificaciones: ""
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();  // Inicializa navigate

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    function validarContrasena(contrasena) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(contrasena);
    }

    async function existeValor(campo, valor) {
        const q = query(collection(db, 'usuarios'), where(campo, '==', valor));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.apellido || !formData.email) {
            setError(t('registroGestor.camposRequeridos'));
            return;
        }

        try {
            await registrarUsuario({ ...formData, rol: 'Mined' });
            setSuccess(true);
            setError(null);
            setFormData({
                nombre: "",
                apellido: "",
                email: user?.email || "",
                institucion: "",
                cargo: "",
                telefono: "",
                direccion: "",
                experiencia: "",
                educacion: "",
                certificaciones: ""
            });
            navigate('/inicio');  //  Inicio
        } catch (error) {
            console.error("Error al registrar gestor:", error);
            setError(t('registroGestor.errorRegistro'));
        }
    };

    return (
        <Container className="mt-4">
            <h4 className="title-gestion">{t('registroGestor.titulo')}</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{t('registroGestor.registroExitoso')}</div>}

            <Card>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('registroGestor.nombre')}</Form.Label>
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
                                    <Form.Label>{t('registroGestor.apellido')}</Form.Label>
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
                                    <Form.Label>{t('registroGestor.email')}</Form.Label>
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
                                    <Form.Label>{t('registroGestor.cargo')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="cargo"
                                        value={formData.cargo}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('registroGestor.institucion')}</Form.Label>
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
                                    <Form.Label>{t('registroGestor.telefono')}</Form.Label>
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
                            <Form.Label>{t('registroGestor.direccion')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('registroGestor.experiencia')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="experiencia"
                                value={formData.experiencia}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('registroGestor.educacion')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="educacion"
                                value={formData.educacion}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('registroGestor.certificaciones')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="certificaciones"
                                value={formData.certificaciones}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Button type="submit" variant="primary">
                            {t('registroGestor.registrar')}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RegistroGestor;

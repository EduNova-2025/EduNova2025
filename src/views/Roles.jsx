import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Table } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../database/authcontext";

const Roles = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [roles, setRoles] = useState([]);
    const [nuevoRol, setNuevoRol] = useState({
        nombre: "",
        descripcion: "",
        permisos: []
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesSnapshot = await getDocs(collection(db, "roles"));
                const rolesData = rolesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRoles(rolesData);
            } catch (error) {
                console.error("Error al obtener roles:", error);
                setError(t('roles.errorObtener'));
            }
        };

        fetchRoles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoRol(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nuevoRol.nombre) {
            setError(t('roles.camposRequeridos'));
            return;
        }

        try {
            await addDoc(collection(db, "roles"), nuevoRol);
            setSuccess(true);
            setError(null);
            setNuevoRol({
                nombre: "",
                descripcion: "",
                permisos: []
            });
        } catch (error) {
            console.error("Error al agregar rol:", error);
            setError(t('roles.errorAgregar'));
        }
    };

    const handleEliminarRol = async (rolId) => {
        if (window.confirm(t('roles.confirmarEliminacion'))) {
            try {
                await deleteDoc(doc(db, "roles", rolId));
                setRoles(roles.filter(rol => rol.id !== rolId));
            } catch (error) {
                console.error("Error al eliminar rol:", error);
                setError(t('roles.errorEliminar'));
            }
        }
    };

    const handleEditarRol = async (rolId, nuevosDatos) => {
        try {
            await updateDoc(doc(db, "roles", rolId), nuevosDatos);
            setRoles(roles.map(rol => 
                rol.id === rolId ? { ...rol, ...nuevosDatos } : rol
            ));
        } catch (error) {
            console.error("Error al editar rol:", error);
            setError(t('roles.errorEditar'));
        }
    };

    return (
        <Container className="mt-4">
            <h4 className="title-gestion">{t('roles.titulo')}</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{t('roles.rolAgregado')}</div>}

            <Row>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <h5>{t('roles.nuevoRol')}</h5>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('roles.nombre')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        value={nuevoRol.nombre}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('roles.descripcion')}</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="descripcion"
                                        value={nuevoRol.descripcion}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Button type="submit" variant="primary">
                                    {t('roles.agregar')}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <h5>{t('roles.listaRoles')}</h5>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>{t('roles.nombre')}</th>
                                        <th>{t('roles.descripcion')}</th>
                                        <th>{t('roles.acciones')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((rol) => (
                                        <tr key={rol.id}>
                                            <td>{rol.nombre}</td>
                                            <td>{rol.descripcion}</td>
                                            <td>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditarRol(rol.id, {
                                                        nombre: rol.nombre,
                                                        descripcion: rol.descripcion
                                                    })}
                                                >
                                                    {t('roles.editar')}
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleEliminarRol(rol.id)}
                                                >
                                                    {t('roles.eliminar')}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Roles;

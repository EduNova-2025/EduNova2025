    import React from "react";
    import { Table, Button } from "react-bootstrap";
    import "bootstrap-icons/font/bootstrap-icons.css";

    const TablaCategorias = ({ categorias, openEditModal, openDeleteModal }) => {
    return (
        <Table striped bordered hover responsive>
        <thead>
            <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {categorias.map((categoria) => (
            <tr key={categoria.id}>
                <td>{categoria.nombre}</td>
                <td>{categoria.descripcion}</td>
                <td>
                <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-2 mt-2"
                    onClick={() => openEditModal(categoria)}
                >
                    <i className="bi bi-pencil-fill"></i>
                </Button>
                <Button
                    variant="outline-danger"
                    size="sm"
                    className="me-2 mt-2"
                    onClick={() => openDeleteModal(categoria)}
                >
                    <i className="bi bi-trash-fill"></i>
                </Button>
                </td>
            </tr>
            ))}
        </tbody>
        </Table>
    );
    };

    export default TablaCategorias;

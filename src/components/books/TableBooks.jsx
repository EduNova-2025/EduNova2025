    import React from "react";
    import { Table, Button, Image } from "react-bootstrap";
    import "bootstrap-icons/font/bootstrap-icons.css";

    const TablaLibros = ({ libros, openEditModal, openDeleteModal }) => {
    return (
        <Table striped bordered hover responsive>
        <thead>
            <tr>
            <th>Imagen</th>
            <th>Título</th>
            <th>Área Educativa</th>
            <th>Dirigido a</th>
            <th>Edición</th>
            <th>Descripción</th>
            <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {libros.map((libro) => (
            <tr key={libro.id}>
                <td>
                {libro.imagen && (
                    <Image src={libro.imagen} width="140" height="200" />
                )}
                </td>
                <td>{libro.titulo}</td>
                <td>{libro.area_edu}</td>
                <td>{libro.dirigido}</td>
                <td>{libro.edicion}</td>
                <td>{libro.descripcion}</td>
                <td>
                <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-2"
                    onClick={() => openEditModal(libro)}
                >
                    <i className="bi bi-pencil"></i>
                </Button>
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => openDeleteModal(libro)}
                >
                    <i className="bi bi-trash"></i>
                </Button>
                </td>
            </tr>
            ))}
        </tbody>
        </Table>
    );
    };

    export default TablaLibros;
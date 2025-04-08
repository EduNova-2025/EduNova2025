import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroLibro = ({
showModal,
setShowModal,
nuevoLibro,
handleInputChange,
handleImageChange,
handlePdfChange,
handleAddLibro,
categorias
}) => {
return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Agregar Libro</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
        <Form.Group className="mb-3">
            <Form.Label>Titulo</Form.Label>
            <Form.Control
            type="text"
            name="titulo"
            value={nuevoLibro.titulo}
            onChange={handleInputChange}
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
            type="text"
            name="descripcion"
            value={nuevoLibro.descripcion}
            onChange={handleInputChange}
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label>Edicion</Form.Label>
            <Form.Control
            type="text"
            name="edicion"
            value={nuevoLibro.edicion}
            onChange={handleInputChange}
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label>Área Educativa</Form.Label>
            <Form.Control
            type="text"
            name="area_edu"
            value={nuevoLibro.area_edu}
            onChange={handleInputChange}
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label>Dirigido a</Form.Label>
            <Form.Control
            type="text"
            name="dirigido"
            value={nuevoLibro.dirigido}
            onChange={handleInputChange}
            />
        <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                name="categoria"
                value={nuevoLibro.categoria}
                onChange={handleInputChange}
                >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                    </option>
                ))}
                </Form.Select>
            </Form.Group>
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label>Documento PDF</Form.Label>
            <Form.Control
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            />
        </Form.Group>
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
        Cancelar
        </Button>
        <Button variant="primary" onClick={handleAddLibro}>
        Guardar
        </Button>
    </Modal.Footer>
    </Modal>
);
};

export default ModalRegistroLibro;
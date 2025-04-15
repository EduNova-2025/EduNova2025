    import React from "react";
    import { Modal, Form, Button } from "react-bootstrap";

    const ModalRegistroCategoria = ({
    showModal,
    setShowModal,
    nuevaCategoria,
    handleInputChange,
    handleAddCategoria,
    }) => {
    return (
        <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="modal-categoria"
        >
        <Modal.Header closeButton>
            <Modal.Title className="modal-title-custom">Nueva Categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
            <Form.Group className="mb-4">
                <Form.Label className="form-label-custom">Nombre</Form.Label>
                <Form.Control
                type="text"
                name="nombre"
                value={nuevaCategoria.nombre}
                onChange={handleInputChange}
                placeholder="Ingresa el nombre"
                className="form-control-custom"
                />
            </Form.Group>
            <Form.Group className="mb-4">
                <Form.Label className="form-label-custom">Descripción</Form.Label>
                <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={nuevaCategoria.descripcion}
                onChange={handleInputChange}
                placeholder="Ingresa la descripción"
                className="form-control-custom"
                />
            </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancelar
            </Button>
            <Button className="btn-style" onClick={handleAddCategoria}>
            Guardar
            </Button>
        </Modal.Footer>
        </Modal>
    );
    };

    export default ModalRegistroCategoria;

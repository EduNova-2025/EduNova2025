    import React from "react";
    import { Modal, Form, Button } from "react-bootstrap";

    const ModalEdicionCategoria = ({
    showEditModal,
    setShowEditModal,
    categoriaEditada,
    handleEditInputChange,
    handleEditCategoria,
    }) => {
    if (!categoriaEditada) return null;

    return (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title className="modal-title-custom">Editar Categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
            <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Nombre</Form.Label>
                <Form.Control
                type="text"
                name="nombre"
                value={categoriaEditada.nombre}
                onChange={handleEditInputChange}
                placeholder="Ingresa el nombre"
                className="form-control-custom"
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Descripción</Form.Label>
                <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={categoriaEditada.descripcion}
                onChange={handleEditInputChange}
                placeholder="Ingresa la descripción"
                className="form-control-custom"
                />
            </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
            </Button>
            <Button className="btn-style" onClick={handleEditCategoria}>
            Actualizar
            </Button>
        </Modal.Footer>
        </Modal>
    );
    };

    export default ModalEdicionCategoria;
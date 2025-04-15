import React from "react";
import { Modal, Form, Button, Image } from "react-bootstrap";

const ModalEdicionLibro = ({
showEditModal,
setShowEditModal,
libroEditado,
handleEditInputChange,
handleEditImageChange,
handleEditPdfChange,
handleEditLibro,
categorias
}) => {
if (!libroEditado) return null;

return (
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title className="modal-title-custom">Editar Libro</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Título</Form.Label>
            <Form.Control
            type="text"
            name="titulo"
            value={libroEditado.titulo}
            onChange={handleEditInputChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Descripción</Form.Label>
            <Form.Control
            type="text"
            name="descripcion"
            value={libroEditado.descripcion}
            onChange={handleEditInputChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Edición</Form.Label>
            <Form.Control
            type="text"
            name="edicion"
            value={libroEditado.edicion}
            onChange={handleEditInputChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Área Educativa</Form.Label>
            <Form.Control
            type="text"
            name="area_edu"
            value={libroEditado.area_edu}
            onChange={handleEditInputChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Dirigido a</Form.Label>
            <Form.Control
            type="text"
            name="dirigido"
            value={libroEditado.dirigido}
            onChange={handleEditInputChange}
            className="form-control-custom"
            />
        <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Categoría</Form.Label>
                <Form.Select
                name="categoria"
                value={libroEditado.categoria}
                onChange={handleEditInputChange}
                className="form-control-custom"
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
            <Form.Label className="form-label-custom">Imagen Actual</Form.Label>
            {libroEditado.imagen && (
            <Image src={libroEditado.imagen} width="150" className="mb-2" />
            )}
            <Form.Control
            type="file"
            accept="image/*"
            onChange={handleEditImageChange}
            className="form-control-custom"
            />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Documento PDF Actual</Form.Label>
            {libroEditado.pdfUrl && (
                <div>
                <a
                href={libroEditado.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                >
                Ver PDF actual
                </a>
                </div>
            )}
            <Form.Control
                type="file"
                accept="application/pdf"
                onChange={handleEditPdfChange}
                className="form-control-custom"
                />
            </Form.Group>
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
        Cancelar
        </Button>
        <Button className="btn-style" onClick={handleEditLibro}>
        Actualizar
        </Button>
    </Modal.Footer>
    </Modal>
);
};

export default ModalEdicionLibro;
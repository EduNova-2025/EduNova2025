import React from "react";
import { Table, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useTranslation } from 'react-i18next';

const TablaLibros = ({ libros, openEditModal, openDeleteModal, handleCopy, openQRModal, generarPDFDetalleLibro }) => {
  const { t } = useTranslation();
  return (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>{t('libros.imagen') || 'Imagen'}</th>
            <th>{t('libros.tituloLibro') || 'Título'}</th>
            <th>{t('libros.areaEducativa') || 'Área Educativa'}</th>
            <th>{t('libros.dirigidoA') || 'Dirigido a'}</th>
            <th>{t('libros.edicion') || 'Edición'}</th>
            <th>{t('libros.categoria') || 'Categoría'}</th>
            <th>{t('libros.descripcion') || 'Descripción'}</th>
            <th>{t('libros.pdf') || 'PDF'}</th>
            <th>{t('libros.acciones') || 'Acciones'}</th>
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
              <td>{libro.categoria}</td>
              <td>{libro.descripcion}</td>
              <td>
                {libro.pdfUrl && (
                  <Button
                    variant="outline-info"
                    size="sm"
                    as="a"
                    href={libro.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t('libros.verPDF') || 'Ver PDF del libro'}
                    className="mt-2"
                  >
                    <i className="bi bi-file-earmark-text"></i>
                  </Button>
                )}
                <Button
                  variant="outline-dark"
                  className="me-2 mt-2"
                  size="sm"
                  onClick={() => openQRModal(libro.pdfUrl)}
                >
                  <i className="bi bi-qr-code"></i>
                </Button>
              </td>
              <td>
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="me-2 mt-2"
                  onClick={() => openEditModal(libro)}
                >
                  <i className="bi bi-pencil-fill"></i>
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-2 mt-2"
                  onClick={() => generarPDFDetalleLibro(libro)}
                >
                  <i className="bi bi-filetype-pdf"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="me-2 mt-2"
                  onClick={() => openDeleteModal(libro)}
                >
                  <i className="bi bi-trash-fill"></i>
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="me-2 mt-2"
                  onClick={() => handleCopy(libro)}
                >
                  <i className="bi bi-clipboard-fill"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TablaLibros;

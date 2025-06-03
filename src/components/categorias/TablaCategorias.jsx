import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useTranslation } from 'react-i18next';

const TablaCategorias = ({ categorias, openEditModal, openDeleteModal }) => {
  const { t } = useTranslation();
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>{t('categorias.nombre')}</th>
          <th>{t('categorias.descripcion')}</th>
          <th>{t('categorias.acciones')}</th>
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

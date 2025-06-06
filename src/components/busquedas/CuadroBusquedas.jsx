import React from "react";
import { InputGroup, Form } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import "bootstrap-icons/font/bootstrap-icons.css";

const CuadroBusquedas = ({ searchText, handleSearchChange }) => {
  const { t } = useTranslation();

  return (
    <InputGroup className="mb-3 animated-border" style={{ width: "400px" }}>
      <InputGroup.Text className="no-border">
        <i className="bi bi-search" data-testid="icono-busqueda"></i>
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={t('common.buscar')}
        value={searchText}
        onChange={handleSearchChange}
        className="input-busqueda"
      />
    </InputGroup>
  );
};

export default CuadroBusquedas;

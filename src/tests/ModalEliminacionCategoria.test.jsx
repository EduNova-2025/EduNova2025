    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";

    describe("ModalEliminacionCategoria", () => {
    const mockSetShowDeleteModal = jest.fn();
    const mockHandleDeleteCategoria = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("muestra el modal con los textos esperados", () => {
        render(
        <ModalEliminacionCategoria
            showDeleteModal={true}
            setShowDeleteModal={mockSetShowDeleteModal}
            handleDeleteCategoria={mockHandleDeleteCategoria}
        />
        );

        expect(screen.getByText("Confirmar Eliminación")).toBeInTheDocument();
        expect(screen.getByText("¿Estás seguro de que deseas eliminar esta categoría?")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
        expect(screen.getByText("Eliminar")).toBeInTheDocument();
    });

    test("llama a setShowDeleteModal(false) al hacer clic en 'Cancelar'", () => {
        render(
        <ModalEliminacionCategoria
            showDeleteModal={true}
            setShowDeleteModal={mockSetShowDeleteModal}
            handleDeleteCategoria={mockHandleDeleteCategoria}
        />
        );

        fireEvent.click(screen.getByText("Cancelar"));
        expect(mockSetShowDeleteModal).toHaveBeenCalledWith(false);
    });

    test("llama a handleDeleteCategoria al hacer clic en 'Eliminar'", () => {
        render(
        <ModalEliminacionCategoria
            showDeleteModal={true}
            setShowDeleteModal={mockSetShowDeleteModal}
            handleDeleteCategoria={mockHandleDeleteCategoria}
        />
        );

        fireEvent.click(screen.getByText("Eliminar"));
        expect(mockHandleDeleteCategoria).toHaveBeenCalled();
    });
    });

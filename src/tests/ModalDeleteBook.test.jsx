    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import ModalEliminacionLibro from "../components/books/ModalDeleteBook";

    // Mock de react-ga4 para evitar eventos reales
    jest.mock("react-ga4", () => ({
    initialize: jest.fn(),
    event: jest.fn(),
    }));

    describe("ModalEliminacionLibro", () => {
    const mockHandleDeleteLibro = jest.fn();
    const mockSetShowDeleteModal = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renderiza el modal cuando showDeleteModal es true", () => {
        render(
        <ModalEliminacionLibro
            showDeleteModal={true}
            setShowDeleteModal={mockSetShowDeleteModal}
            handleDeleteLibro={mockHandleDeleteLibro}
        />
        );

        expect(screen.getByText("Confirmar Eliminación")).toBeInTheDocument();
        expect(screen.getByText("¿Estás seguro de que deseas eliminar este libro?")).toBeInTheDocument();
    });

    it("cierra el modal al hacer clic en 'Cancelar'", () => {
        render(
        <ModalEliminacionLibro
            showDeleteModal={true}
            setShowDeleteModal={mockSetShowDeleteModal}
            handleDeleteLibro={mockHandleDeleteLibro}
        />
        );

        const cancelarButton = screen.getByText("Cancelar");
        fireEvent.click(cancelarButton);

        expect(mockSetShowDeleteModal).toHaveBeenCalledWith(false);
    });

    it("ejecuta handleDeleteLibro y tracking al hacer clic en 'Eliminar'", () => {
        const { getByText } = render(
        <ModalEliminacionLibro
            showDeleteModal={true}
            setShowDeleteModal={mockSetShowDeleteModal}
            handleDeleteLibro={mockHandleDeleteLibro}
        />
        );

        const eliminarButton = getByText("Eliminar");
        fireEvent.click(eliminarButton);

        expect(mockHandleDeleteLibro).toHaveBeenCalled();
        expect(require("react-ga4").event).toHaveBeenCalledWith({
        category: "Libros",
        action: "Eliminación",
        origin: "registroteleclases",
        });
    });
    });

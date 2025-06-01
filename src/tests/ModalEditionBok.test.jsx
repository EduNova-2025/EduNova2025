    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import ModalEdicionLibro from "../components/books/ModalEditionBook";

    describe("ModalEdicionLibro", () => {
    const mockLibro = {
        titulo: "Libro de Prueba",
        descripcion: "Descripción de prueba",
        edicion: "2",
        area_edu: "Primaria",
        dirigido: "Docentes",
        categoria: "Matemáticas",
        imagen: "https://via.placeholder.com/150",
        pdfUrl: "https://example.com/doc.pdf",
    };

    const mockCategorias = [
        { id: 1, nombre: "Matemáticas" },
        { id: 2, nombre: "Lengua" },
    ];

    const defaultProps = {
        showEditModal: true,
        setShowEditModal: jest.fn(),
        libroEditado: mockLibro,
        handleEditInputChange: jest.fn(),
        handleEditImageChange: jest.fn(),
        handleEditPdfChange: jest.fn(),
        handleEditLibro: jest.fn(),
        categorias: mockCategorias,
    };

    it("renderiza correctamente el modal de edición", () => {
        render(<ModalEdicionLibro {...defaultProps} />);
        
        expect(screen.getByText("Editar Libro")).toBeInTheDocument();
        expect(screen.getByLabelText("Título")).toBeInTheDocument();
        expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
        expect(screen.getByLabelText("Edición")).toBeInTheDocument();
        expect(screen.getByLabelText("Área Educativa")).toBeInTheDocument();
        expect(screen.getByLabelText("Dirigido a")).toBeInTheDocument();
        expect(screen.getByLabelText("Categoría")).toBeInTheDocument();
        expect(screen.getByText("Ver PDF actual")).toBeInTheDocument();
        expect(screen.getByText("Actualizar")).toBeInTheDocument();
    });

    it("llama a handleEditLibro cuando se hace clic en Actualizar", () => {
        render(<ModalEdicionLibro {...defaultProps} />);
        fireEvent.click(screen.getByText("Actualizar"));
        expect(defaultProps.handleEditLibro).toHaveBeenCalled();
    });

    it("cierra el modal cuando se hace clic en Cancelar", () => {
        render(<ModalEdicionLibro {...defaultProps} />);
        fireEvent.click(screen.getByText("Cancelar"));
        expect(defaultProps.setShowEditModal).toHaveBeenCalledWith(false);
    });
    });

    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import ModalRegistroLibro from "../components/books/ModalRecordBook";
    import ReactGA from "react-ga4";

    // Mock de funciones
    const mockSetShowModal = jest.fn();
    const mockHandleInputChange = jest.fn();
    const mockHandleImageChange = jest.fn();
    const mockHandlePdfChange = jest.fn();
    const mockHandleAddLibro = jest.fn();
    const mockReactGAEvent = jest.fn();

    jest.mock("react-ga4", () => ({
    event: jest.fn(),
    initialize: jest.fn(),
    }));

    describe("ModalRegistroLibro", () => {
    const categorias = [{ id: 1, nombre: "Matemáticas" }];
    const nuevoLibro = {
        titulo: "Libro de Prueba",
        descripcion: "Descripción de prueba",
        edicion: "1",
        area_edu: "Primaria",
        dirigido: "Docentes",
        categoria: "Matemáticas"
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renderiza correctamente cuando showModal es true", () => {
        render(
        <ModalRegistroLibro
            showModal={true}
            setShowModal={mockSetShowModal}
            nuevoLibro={nuevoLibro}
            handleInputChange={mockHandleInputChange}
            handleImageChange={mockHandleImageChange}
            handlePdfChange={mockHandlePdfChange}
            handleAddLibro={mockHandleAddLibro}
            categorias={categorias}
        />
        );

        expect(screen.getByText("Agregar Libro")).toBeInTheDocument();
        expect(screen.getByLabelText("Titulo")).toBeInTheDocument();
        expect(screen.getByLabelText("Categoría")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
        expect(screen.getByText("Guardar")).toBeInTheDocument();
    });

    it("ejecuta handleAddLibro y tracking GA al hacer clic en Guardar", () => {
        render(
        <ModalRegistroLibro
            showModal={true}
            setShowModal={mockSetShowModal}
            nuevoLibro={nuevoLibro}
            handleInputChange={mockHandleInputChange}
            handleImageChange={mockHandleImageChange}
            handlePdfChange={mockHandlePdfChange}
            handleAddLibro={mockHandleAddLibro}
            categorias={categorias}
        />
        );

        const guardarBtn = screen.getByText("Guardar");
        fireEvent.click(guardarBtn);

        expect(mockHandleAddLibro).toHaveBeenCalled();
        expect(ReactGA.event).toHaveBeenCalledWith(
        expect.objectContaining({
            category: "Libros",
            action: "Registro",
            label: "Libro de Prueba",
            origin: "registroteleclases"
        })
        );
    });
    });

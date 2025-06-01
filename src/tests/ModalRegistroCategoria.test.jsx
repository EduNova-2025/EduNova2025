    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";

    describe("ModalRegistroCategoria", () => {
    const mockSetShowModal = jest.fn();
    const mockHandleInputChange = jest.fn();
    const mockHandleAddCategoria = jest.fn();
    const nuevaCategoria = { nombre: "Matemáticas", descripcion: "Recursos de matemática básica" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("muestra el modal con campos de nombre y descripción", () => {
        render(
        <ModalRegistroCategoria
            showModal={true}
            setShowModal={mockSetShowModal}
            nuevaCategoria={nuevaCategoria}
            handleInputChange={mockHandleInputChange}
            handleAddCategoria={mockHandleAddCategoria}
        />
        );

        expect(screen.getByText("Nueva Categoría")).toBeInTheDocument();
        expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
        expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
        expect(screen.getByText("Guardar")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    test("llama a setShowModal(false) al hacer clic en 'Cancelar'", () => {
        render(
        <ModalRegistroCategoria
            showModal={true}
            setShowModal={mockSetShowModal}
            nuevaCategoria={nuevaCategoria}
            handleInputChange={mockHandleInputChange}
            handleAddCategoria={mockHandleAddCategoria}
        />
        );

        fireEvent.click(screen.getByText("Cancelar"));
        expect(mockSetShowModal).toHaveBeenCalledWith(false);
    });

    test("llama a handleAddCategoria al hacer clic en 'Guardar'", () => {
        render(
        <ModalRegistroCategoria
            showModal={true}
            setShowModal={mockSetShowModal}
            nuevaCategoria={nuevaCategoria}
            handleInputChange={mockHandleInputChange}
            handleAddCategoria={mockHandleAddCategoria}
        />
        );

        fireEvent.click(screen.getByText("Guardar"));
        expect(mockHandleAddCategoria).toHaveBeenCalled();
    });

    test("llama a handleInputChange al cambiar los campos de entrada", () => {
        render(
        <ModalRegistroCategoria
            showModal={true}
            setShowModal={mockSetShowModal}
            nuevaCategoria={nuevaCategoria}
            handleInputChange={mockHandleInputChange}
            handleAddCategoria={mockHandleAddCategoria}
        />
        );

        fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { value: "Ciencias", name: "nombre" }
        });
        expect(mockHandleInputChange).toHaveBeenCalled();

        fireEvent.change(screen.getByLabelText("Descripción"), {
        target: { value: "Descripción de prueba", name: "descripcion" }
        });
        expect(mockHandleInputChange).toHaveBeenCalled();
    });
    });

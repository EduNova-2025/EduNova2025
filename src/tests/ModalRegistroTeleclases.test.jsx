    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import ModalRegistroTeleclases from "../components/teleclases/ModalRegistroTeleclases";

    describe("ModalRegistroTeleclases", () => {
    const mockSetShowModal = jest.fn();
    const mockHandleInputChange = jest.fn();
    const mockHandleVideoChange = jest.fn();
    const mockHandleAddTeleclase = jest.fn();

    const nuevaTeleclase = {
        titulo: "Título de prueba",
        materia: "Lengua y literatura",
        descripcion: "Descripción de prueba",
    };

    beforeEach(() => {
        render(
        <ModalRegistroTeleclases
            showModal={true}
            setShowModal={mockSetShowModal}
            nuevaTeleclase={nuevaTeleclase}
            handleInputChange={mockHandleInputChange}
            handleVideoChange={mockHandleVideoChange}
            handleAddTeleclase={mockHandleAddTeleclase}
        />
        );
    });

    test("renderiza correctamente los campos del formulario", () => {
        expect(screen.getByText("Agregar Teleclase")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Agrega un título")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Escribe aqui")).toBeInTheDocument();
        expect(screen.getByLabelText("Materia")).toBeInTheDocument();
        expect(screen.getByText("Guardar")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    test("permite escribir en los campos y seleccionar materia", () => {
        const tituloInput = screen.getByPlaceholderText("Agrega un título");
        const descripcionInput = screen.getByPlaceholderText("Escribe aqui");
        const materiaSelect = screen.getByLabelText("Materia");

        fireEvent.change(tituloInput, { target: { value: "Nuevo título" } });
        fireEvent.change(descripcionInput, { target: { value: "Nueva descripción" } });
        fireEvent.change(materiaSelect, { target: { value: "Inglés" } });

        expect(mockHandleInputChange).toHaveBeenCalledTimes(3);
    });

    test("ejecuta handleAddTeleclase al hacer clic en Guardar", () => {
        const guardarButton = screen.getByText("Guardar");
        fireEvent.click(guardarButton);
        expect(mockHandleAddTeleclase).toHaveBeenCalled();
    });

    test("ejecuta setShowModal al hacer clic en Cancelar", () => {
        const cancelarButton = screen.getByText("Cancelar");
        fireEvent.click(cancelarButton);
        expect(mockSetShowModal).toHaveBeenCalledWith(false);
    });
    });

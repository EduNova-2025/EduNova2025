    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import ModalEliminacionTeleclases from "../components/teleclases/ModalEliminacionTeleclases"; // Ajusta la ruta según tu estructura
    import ReactGA from "react-ga4";

    // Mock de ReactGA
    jest.mock("react-ga4", () => ({
    initialize: jest.fn(),
    event: jest.fn()
    }));

    describe("ModalEliminacionTeleclases", () => {
    const mockSetShowModal = jest.fn();
    const mockHandleDeleteTeleclase = jest.fn();
    const mockTitle = "Teleclase de Matemáticas";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("debe renderizar correctamente el contenido del modal", () => {
        render(
        <ModalEliminacionTeleclases
            showModal={true}
            setShowModal={mockSetShowModal}
            handleDeleteTeleclase={mockHandleDeleteTeleclase}
            teleclaseTitle={mockTitle}
        />
        );

        expect(screen.getByText("Confirmar Eliminación")).toBeInTheDocument();
        expect(screen.getByText("¿Está seguro que desea eliminar la teleclase?")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
        expect(screen.getByText("Eliminar")).toBeInTheDocument();
    });

    test("debe cerrar el modal al hacer clic en 'Cancelar'", () => {
        render(
        <ModalEliminacionTeleclases
            showModal={true}
            setShowModal={mockSetShowModal}
            handleDeleteTeleclase={mockHandleDeleteTeleclase}
            teleclaseTitle={mockTitle}
        />
        );

        fireEvent.click(screen.getByText("Cancelar"));
        expect(mockSetShowModal).toHaveBeenCalledWith(false);
    });

    test("debe ejecutar la eliminación y rastreo al hacer clic en 'Eliminar'", () => {
        render(
        <ModalEliminacionTeleclases
            showModal={true}
            setShowModal={mockSetShowModal}
            handleDeleteTeleclase={mockHandleDeleteTeleclase}
            teleclaseTitle={mockTitle}
        />
        );

        fireEvent.click(screen.getByText("Eliminar"));

        expect(mockHandleDeleteTeleclase).toHaveBeenCalled();
        expect(ReactGA.event).toHaveBeenCalledWith({
        category: "Teleclases",
        action: "Eliminación",
        label: "Teleclase de Matemáticas",
        origin: "registroteleclases"
        });
    });
    });

    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import { MemoryRouter } from "react-router-dom";
    import TarjetaLibro from "../components/catalogo/TarjetaLibro";
    import ReactGA from "react-ga4";

    // Mock de ReactGA
    jest.mock("react-ga4", () => ({
    event: jest.fn()
    }));

    describe("TarjetaLibro", () => {
    const libroMock = {
        id: "123",
        titulo: "Mi Libro de Prueba",
        imagen: "http://example.com/imagen.jpg",
        categoria: "Ciencia"
    };

    beforeEach(() => {
        render(
        <MemoryRouter>
            <TarjetaLibro libro={libroMock} />
        </MemoryRouter>
        );
    });

    it("renderiza el título del libro", () => {
        expect(screen.getByText(libroMock.titulo)).toBeInTheDocument();
    });

    it("muestra la imagen si está disponible", () => {
        const img = screen.getByAltText(libroMock.titulo);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", libroMock.imagen);
    });

    it("tiene un enlace que lleva a la página del libro", () => {
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", `/libro/${libroMock.id}`);
    });

    it("dispara el evento de GA al hacer clic en el enlace", () => {
        const link = screen.getByRole("link");
        fireEvent.click(link);
        expect(ReactGA.event).toHaveBeenCalledWith({
        category: "Ciencia",
        action: "Leer PDF",
        label: "Mi Libro de Prueba"
        });
    });
    });

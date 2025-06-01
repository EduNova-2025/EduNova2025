    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

    describe("CuadroBusquedas", () => {
    const mockHandleSearchChange = jest.fn();
    const searchText = "prueba";

    beforeEach(() => {
        render(
        <CuadroBusquedas
            searchText={searchText}
            handleSearchChange={mockHandleSearchChange}
        />
        );
    });

    it("muestra el icono de búsqueda", () => {
        expect(screen.getByTestId("icono-busqueda")).toBeInTheDocument();
    });

    it("muestra el texto del input correctamente", () => {
        const input = screen.getByPlaceholderText("Buscar ...");
        expect(input.value).toBe(searchText);
    });

    it("dispara handleSearchChange al escribir en el input", () => {
        const input = screen.getByPlaceholderText("Buscar ...");
        fireEvent.change(input, { target: { value: "nuevo texto" } });
        expect(mockHandleSearchChange).toHaveBeenCalledTimes(1);
    });
    });

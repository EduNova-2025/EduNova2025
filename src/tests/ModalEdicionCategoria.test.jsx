    import React from "react";
    import { render, screen, fireEvent } from "@testing-library/react";
    import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";

    describe("ModalEdicionCategoria", () => {
    const mockSetShowEditModal = jest.fn();
    const mockHandleEditInputChange = jest.fn();
    const mockHandleEditCategoria = jest.fn();

    const categoriaEditada = {
        nombre: "Historia",
        descripcion: "Material de historia universal",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("muestra el modal con los campos prellenados", () => {
        render(
        <ModalEdicionCategoria
            showEditModal={true}
            setShowEditModal={mockSetShowEditModal}
            categoriaEditada={categoriaEditada}
            handleEditInputChange={mockHandleEditInputChange}
            handleEditCategoria={mockHandleEditCategoria}
        />
        );

        expect(screen.getByText("Editar Categoría")).toBeInTheDocument();
        expect(screen.getByLabelText("Nombre")).toHaveValue("Historia");
        expect(screen.getByLabelText("Descripción")).toHaveValue("Material de historia universal");
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
        expect(screen.getByText("Actualizar")).toBeInTheDocument();
    });

    test("llama a handleEditInputChange al cambiar el nombre", () => {
        render(
        <ModalEdicionCategoria
            showEditModal={true}
            setShowEditModal={mockSetShowEditModal}
            categoriaEditada={categoriaEditada}
            handleEditInputChange={mockHandleEditInputChange}
            handleEditCategoria={mockHandleEditCategoria}
        />
        );

        fireEvent.change(screen.getByLabelText("Nombre"), {
        target: { name: "nombre", value: "Geografía" },
        });

        expect(mockHandleEditInputChange).toHaveBeenCalled();
    });

    test("llama a setShowEditModal al hacer clic en Cancelar", () => {
        render(
        <ModalEdicionCategoria
            showEditModal={true}
            setShowEditModal={mockSetShowEditModal}
            categoriaEditada={categoriaEditada}
            handleEditInputChange={mockHandleEditInputChange}
            handleEditCategoria={mockHandleEditCategoria}
        />
        );

        fireEvent.click(screen.getByText("Cancelar"));
        expect(mockSetShowEditModal).toHaveBeenCalledWith(false);
    });

    test("llama a handleEditCategoria al hacer clic en Actualizar", () => {
        render(
        <ModalEdicionCategoria
            showEditModal={true}
            setShowEditModal={mockSetShowEditModal}
            categoriaEditada={categoriaEditada}
            handleEditInputChange={mockHandleEditInputChange}
            handleEditCategoria={mockHandleEditCategoria}
        />
        );

        fireEvent.click(screen.getByText("Actualizar"));
        expect(mockHandleEditCategoria).toHaveBeenCalled();
    });

    test("no renderiza nada si categoriaEditada es null", () => {
        const { container } = render(
        <ModalEdicionCategoria
            showEditModal={true}
            setShowEditModal={mockSetShowEditModal}
            categoriaEditada={null}
            handleEditInputChange={mockHandleEditInputChange}
            handleEditCategoria={mockHandleEditCategoria}
        />
        );

        expect(container.firstChild).toBeNull();
    });
    });

    import React from 'react';
    import { render, screen, fireEvent } from '@testing-library/react';
    import ModalEdicionTeleclases from '../components/teleclases/ModalEdicionTeleclases';

    describe('ModalEdicionTeleclases', () => {
    const mockTeleclase = {
        titulo: 'Clase de Matemática',
        materia: 'Matemática',
        descripcion: 'Descripción original',
        videoUrl: 'https://example.com/video.mp4',
    };

    const setup = (overrideProps = {}) => {
        const props = {
        showModal: true,
        setShowModal: jest.fn(),
        teleclase: mockTeleclase,
        handleInputChange: jest.fn(),
        handleVideoChange: jest.fn(),
        handleEditTeleclase: jest.fn(),
        ...overrideProps,
        };

        render(<ModalEdicionTeleclases {...props} />);
        return props;
    };

    it('renderiza correctamente con datos de teleclase', () => {
        setup();
        expect(screen.getByText('Editar Teleclase')).toBeInTheDocument();
        expect(screen.getByLabelText('Título')).toHaveValue(mockTeleclase.titulo);
        expect(screen.getByLabelText('Descripción')).toHaveValue(mockTeleclase.descripcion);
        expect(screen.getByLabelText('Materia')).toHaveValue(mockTeleclase.materia);
        expect(screen.getByText('Video Actual')).toBeInTheDocument();
    });

    it('permite modificar campos y llama a los handlers', () => {
        const props = setup();
        fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Nuevo Título' } });
        expect(props.handleInputChange).toHaveBeenCalled();
    });

    it('llama a handleEditTeleclase cuando se hace clic en Actualizar', () => {
        const props = setup();
        const botonActualizar = screen.getByText('Actualizar');
        fireEvent.click(botonActualizar);
        expect(props.handleEditTeleclase).toHaveBeenCalled();
    });

    it('llama a setShowModal(false) cuando se hace clic en Cancelar', () => {
        const props = setup();
        const botonCancelar = screen.getByText('Cancelar');
        fireEvent.click(botonCancelar);
        expect(props.setShowModal).toHaveBeenCalledWith(false);
    });

    it('no renderiza nada si no hay teleclase', () => {
        const { container } = render(<ModalEdicionTeleclases showModal={true} teleclase={null} />);
        expect(container.firstChild).toBeNull();
    });
    });

    import React from 'react';
    import { render, screen, fireEvent } from '@testing-library/react';
    import TarjetaTeleclasesMINED from '../components/teleclases/TarjetaTeleclaseMINED';

    describe('TarjetaTeleclasesMINED', () => {
    const mockTeleclase = {
        titulo: 'Clase de Matemática',
        materia: 'Matemática',
        descripcion: 'Descripción de la clase',
        videoUrl: 'https://example.com/video.mp4'
    };

    const onEdit = jest.fn();
    const onDelete = jest.fn();

    beforeEach(() => {
        render(
        <TarjetaTeleclasesMINED 
            teleclase={mockTeleclase} 
            onEdit={onEdit} 
            onDelete={onDelete} 
        />
        );
    });

    it('renderiza el título, materia y descripción', () => {
        expect(screen.getByText(/Clase de Matemática - Matemática/i)).toBeInTheDocument();
        expect(screen.getByText(/Descripción de la clase/i)).toBeInTheDocument();
    });

    it('muestra el video si videoUrl está presente', () => {
        const videoElement = screen.getByRole('video');
        expect(videoElement).toBeInTheDocument();
        expect(videoElement).toHaveAttribute('src', mockTeleclase.videoUrl);
    });

    it('llama a onEdit cuando se hace clic en el botón de editar', () => {
        fireEvent.click(screen.getByRole('button', { name: /editar teleclase/i }));
        expect(onEdit).toHaveBeenCalled();
    });

    it('llama a onDelete cuando se hace clic en el botón de eliminar', () => {
        fireEvent.click(screen.getByRole('button', { name: /eliminar teleclase/i }));
        expect(onDelete).toHaveBeenCalled();
    });
    });

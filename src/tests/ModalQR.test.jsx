    import React from 'react';
    import { render, screen, fireEvent } from '@testing-library/react';
    import ModalQR from '../components/qr/ModalQR'; // ajusta la ruta según tu estructura

    describe('ModalQR', () => {
    const mockHandleClose = jest.fn();
    const sampleURL = 'https://example.com/test.pdf';

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('muestra el modal con código QR cuando show es true y hay qrURL', () => {
        render(<ModalQR show={true} handleClose={mockHandleClose} qrURL={sampleURL} />);

        expect(screen.getByText('Código QR del PDF')).toBeInTheDocument();
        expect(screen.getByTitle('Escanea para descargar el PDF')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument();
    });

    test('muestra mensaje alternativo si no hay qrURL', () => {
        render(<ModalQR show={true} handleClose={mockHandleClose} qrURL={null} />);

        expect(screen.getByText('No hay URL disponible para generar el QR.')).toBeInTheDocument();
    });

    test('no muestra el modal si show es false', () => {
        const { container } = render(<ModalQR show={false} handleClose={mockHandleClose} qrURL={sampleURL} />);
        expect(container.querySelector('.modal.show')).not.toBeInTheDocument();
    });

    test('llama a handleClose al hacer clic en "Cerrar"', () => {
        render(<ModalQR show={true} handleClose={mockHandleClose} qrURL={sampleURL} />);
        fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
        expect(mockHandleClose).toHaveBeenCalledTimes(1);
    });
    });

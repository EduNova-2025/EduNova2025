import React, { useState, useEffect } from 'react';
import '../styles/TeleClase.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { db, storage} from '../database/firebaseconfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ModalRegistroTeleclases from '../components/teleclases/ModalRegistroTeleclases';
import TarjetaTeleclasesMINED from '../components/teleclases/TarjetaTeleclaseMINED';
import BuscadorTeleclases from '../components/teleclases/BuscadorTeleclases';
import { Row, Container } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ModalEdicionTeleclases from '../components/teleclases/ModalEdicionTeleclases';
import ModalEliminacionTeleclases from '../components/teleclases/ModalEliminacionTeleclases';
import Paginacion from '../components/ordenamiento/Paginacion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const TeleClaseMINED = () => {
    const [teleclases, setTeleclases] = useState([]);
    const [materias, setMaterias] = useState(['Todos']);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTeleclase, setSelectedTeleclase] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Número de teleclases por página

    const [nuevaTeleclase, setNuevaTeleclase] = useState({
        titulo: '',
        materia: '',
        descripcion: '',
        videoUrl: '',
    });
    const [videoFile, setVideoFile] = useState(null);

    const teleclasesCollection = collection(db, 'teleclases');

    const fetchData = async () => {
        try {
            const teleclasesData = await getDocs(teleclasesCollection);
            const fetchedTeleclases = teleclasesData.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setTeleclases(fetchedTeleclases);

            // Obtener materias únicas
            const uniqueMaterias = ['Todos', ...new Set(fetchedTeleclases.map(teleclase => teleclase.materia))];
            setMaterias(uniqueMaterias);
        } catch (error) {
            console.error("Error al obtener teleclases:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaTeleclase((prev) => ({ ...prev, [name]: value }));
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
        } else {
            alert('Por favor, selecciona un archivo de video.');
        }
    };

    const handleAddTeleclase = async () => {
        // Validaciones para agregar teleclase
        if (!nuevaTeleclase.titulo.trim()) {
            alert('Por favor, ingrese un título para la teleclase.');
            return;
        }
        if (!nuevaTeleclase.materia.trim()) {
            alert('Por favor, seleccione una materia para la teleclase.');
            return;
        }
        if (!nuevaTeleclase.descripcion.trim()) {
            alert('Por favor, ingrese una descripción para la teleclase.');
            return;
        }
        if (!videoFile) {
            alert('Por favor, seleccione un video para la teleclase.');
            return;
        }

        // Validar el formato del video
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedTypes.includes(videoFile.type)) {
            alert('Por favor, seleccione un archivo de video válido (MP4, WebM, o OGG).');
            return;
        }

        // Validar el tamaño del video (máximo 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB en bytes
        if (videoFile.size > maxSize) {
            alert('El archivo de video es demasiado grande. El tamaño máximo permitido es 100MB.');
            return;
        }

        try {
            const storageRef = ref(storage, `teleclases/${videoFile.name}`);
            await uploadBytes(storageRef, videoFile);
            const videoUrl = await getDownloadURL(storageRef);

            await addDoc(teleclasesCollection, { ...nuevaTeleclase, videoUrl });
            setShowModal(false);
            setNuevaTeleclase({ titulo: '', materia: '', descripcion: '', videoUrl: '' });
            setVideoFile(null);
            await fetchData();
        } catch (error) {
            console.error('Error al agregar teleclase:', error);
            alert('Ocurrió un error al agregar la teleclase. Por favor, intente nuevamente.');
        }
    };

    const handleEditTeleclase = async () => {
        if (!selectedTeleclase) return;

        // Validaciones para editar teleclase
        if (!selectedTeleclase.titulo.trim()) {
            alert('Por favor, ingrese un título para la teleclase.');
            return;
        }
        if (!selectedTeleclase.materia.trim()) {
            alert('Por favor, seleccione una materia para la teleclase.');
            return;
        }
        if (!selectedTeleclase.descripcion.trim()) {
            alert('Por favor, ingrese una descripción para la teleclase.');
            return;
        }

        if (videoFile) {
            // Validar el formato del video si se está actualizando
            const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
            if (!allowedTypes.includes(videoFile.type)) {
                alert('Por favor, seleccione un archivo de video válido (MP4, WebM, o OGG).');
                return;
            }

            // Validar el tamaño del video si se está actualizando
            const maxSize = 100 * 1024 * 1024; // 100MB en bytes
            if (videoFile.size > maxSize) {
                alert('El archivo de video es demasiado grande. El tamaño máximo permitido es 100MB.');
                return;
            }
        }

        try {
            let videoUrl = selectedTeleclase.videoUrl;

            if (videoFile) {
                const storageRef = ref(storage, `teleclases/${videoFile.name}`);
                await uploadBytes(storageRef, videoFile);
                videoUrl = await getDownloadURL(storageRef);
            }

            const teleclaseRef = doc(db, 'teleclases', selectedTeleclase.id);
            await updateDoc(teleclaseRef, {
                ...selectedTeleclase,
                videoUrl
            });
            setShowEditModal(false);
            setSelectedTeleclase(null);
            setVideoFile(null);
            await fetchData();
        } catch (error) {
            console.error('Error al actualizar teleclase:', error);
            alert('Ocurrió un error al actualizar la teleclase. Por favor, intente nuevamente.');
        }
    };

    const handleDeleteTeleclase = async () => {
        if (!selectedTeleclase) return;

        try {
            await deleteDoc(doc(db, 'teleclases', selectedTeleclase.id));
            setShowDeleteModal(false);
            setSelectedTeleclase(null);
            await fetchData();
        } catch (error) {
            console.error('Error al eliminar teleclase:', error);
        }
    };

    const handleSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
    };

    const handleMateriaFilter = (materia) => {
        setMateriaSeleccionada(materia);
        setCurrentPage(1);
    };

    const filteredTeleclases = teleclases
        .filter(teleclase => {
            const matchesSearch = teleclase.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMateria = materiaSeleccionada === 'Todos' || teleclase.materia === materiaSeleccionada;
            return matchesSearch && matchesMateria;
        });

    // Calcular las teleclases para la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTeleclases = filteredTeleclases.slice(indexOfFirstItem, indexOfLastItem);

    // Evento: Visualización de teleclase (edición)
    const openEditModal = (teleclase) => {
        setSelectedTeleclase(teleclase);
        setShowEditModal(true);
    };

    // Evento: Visualización de teleclase (eliminación)
    const openDeleteModal = (teleclase) => {
        setSelectedTeleclase(teleclase);
        setShowDeleteModal(true);
    };

    const generarPDFTeleclases = () => {
        const doc = new jsPDF();
        doc.setFillColor(28, 41, 51);
        doc.rect(0, 0, 220, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("Reporte de Teleclases", doc.internal.pageSize.width / 2, 18, 'center');

        const columnas = [
          "#",
          "Título",
          "Materia",
          "Descripción"
        ];

        const filas = teleclases.map((teleclase, index) => [
          index + 1,
          teleclase.titulo,
          teleclase.materia,
          teleclase.descripcion
        ]);

        const totalPaginas = "{total_pages_count_string}";

        autoTable(doc, {
          head: [columnas],
          body: filas,
          startY: 40,
          theme: "grid",
          styles: {
            cellPadding: 2,
            fontSize: 10,
          },
          margin: {
            top: 20,
            right: 20,
            left: 20
          },
          tableWidth: "auto",
          columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: "auto" },
            2: { cellWidth: "auto" },
            3: { cellWidth: 60 },
          },
          pageBreak: "auto",
          rowPageBreak: "auto",
          didDrawPage: function (data) {
            const alturaPagina = doc.internal.pageSize.height;
            const anchoPagina = doc.internal.pageSize.width;
            const numeroPagina = doc.internal.getNumberOfPages();
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const piePagina = `Página ${numeroPagina} de ${totalPaginas}`;
            doc.text(piePagina, anchoPagina / 2 + 15, alturaPagina - 10, 'center');
          },
        });

        if (typeof doc.putTotalPages === "function") {
          doc.putTotalPages(totalPaginas);
        }

        const dia = String(new Date().getDate()).padStart(2, '0');
        const mes = String(new Date().getMonth() + 1).padStart(2, '0');
        const anio = new Date().getFullYear();
        const nombreArchivo = `Reporte de Teleclases ${dia}-${mes}-${anio}.pdf`;

        doc.save(nombreArchivo);
    };

    const exportarExcelTeleclases = () => {
        const datos = teleclases.map((teleclase, index) => ({
            "#": index + 1,
            "Título": teleclase.titulo,
            "Materia": teleclase.materia,
            "Descripción": teleclase.descripcion,
        }));

        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Teleclases");

        const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

        const dia = String(new Date().getDate()).padStart(2, '0');
        const mes = String(new Date().getMonth() + 1).padStart(2, '0');
        const anio = new Date().getFullYear();
        const nombreArchivo = `Reporte de Teleclases ${dia}-${mes}-${anio}.xlsx`;

        saveAs(blob, nombreArchivo);
    };

    return (
        <div className="contenedor-teleclase-mined" style={{}}> 
            <BuscadorTeleclases onSearch={handleSearch} />
            <div className="botones-filtro">
                {materias.map((materia, index) => (
                    <button 
                        key={index}
                        onClick={() => {
                            handleMateriaFilter(materia);
                        }}
                        className={materiaSeleccionada === materia ? 'active' : ''}
                    >
                        {materia}
                    </button>
                ))}
            </div>
            <div className="d-flex justify-content-center gap-2 mb-3">
                <button className="btn-agregar" onClick={generarPDFTeleclases}>
                    <i className="bi bi-file-earmark-arrow-down"></i> Descargar Reporte PDF
                </button>
                <button className="btn-agregar" onClick={exportarExcelTeleclases}>
                    <i className="bi bi-file-earmark-excel"></i> Descargar Excel
                </button>
                <button className="btn-agregar" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg"></i> Agregar Teleclase
                </button>
            </div>
            <div className="catalogo-teleclases">
                <Container fluid>
                    <Row>
                        {currentTeleclases.map((teleclase) => (
                            <TarjetaTeleclasesMINED 
                                key={teleclase.id} 
                                teleclase={teleclase}
                                onEdit={() => {
                                    openEditModal(teleclase);
                                }}
                                onDelete={() => {
                                    openDeleteModal(teleclase);
                                }}
                            />
                        ))}
                    </Row>
                </Container>
            </div>

            <Paginacion
                itemsPerPage={itemsPerPage}
                totalItems={filteredTeleclases.length}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            
            <ModalRegistroTeleclases
                showModal={showModal}
                setShowModal={setShowModal}
                nuevaTeleclase={nuevaTeleclase}
                handleInputChange={handleInputChange}
                handleVideoChange={handleVideoChange}
                handleAddTeleclase={handleAddTeleclase}
            />
            
            <ModalEdicionTeleclases
                showModal={showEditModal}
                setShowModal={setShowEditModal}
                teleclase={selectedTeleclase}
                handleInputChange={(e) => {
                    const { name, value } = e.target;
                    setSelectedTeleclase(prev => ({...prev, [name]: value}));
                }}
                handleVideoChange={handleVideoChange}
                handleEditTeleclase={handleEditTeleclase}
            />
            
            <ModalEliminacionTeleclases
                showModal={showDeleteModal}
                setShowModal={setShowDeleteModal}
                handleDeleteTeleclase={handleDeleteTeleclase}
                teleclaseTitle={selectedTeleclase?.titulo}
            />
        </div>
    );
};

export default TeleClaseMINED;

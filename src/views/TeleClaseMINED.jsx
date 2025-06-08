import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const [teleclases, setTeleclases] = useState([]);
    const [materias, setMaterias] = useState([t('teleclase.todas')]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(t('teleclase.todas'));
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTeleclase, setSelectedTeleclase] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

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

            const uniqueMaterias = [t('teleclase.todas'), ...new Set(fetchedTeleclases.map(teleclase => teleclase.materia))];
            setMaterias(uniqueMaterias);
        } catch (error) {
            console.error(t('teleclase.errorObtener'), error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaTeleclase((prev) => ({ ...prev, [name]: value }));
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
        } else {
            alert(t('teleclase.seleccionarVideo'));
        }
    };

    const handleAddTeleclase = async () => {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedTypes.includes(videoFile.type)) {
            alert(t('teleclase.seleccionarVideo'));
            return;
        }

        const maxSize = 100 * 1024 * 1024;
        if (videoFile.size > maxSize) {
            alert(t('teleclase.errorAgregar'));
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
            console.error(t('teleclase.errorAgregar'), error);
            alert(t('teleclase.errorAgregar'));
        }
    };

    const handleEditTeleclase = async () => {
        if (!selectedTeleclase) return;

        if (!selectedTeleclase.titulo.trim()) {
            alert(t('teleclase.agregarTitulo'));
            return;
        }
        if (!selectedTeleclase.materia.trim()) {
            alert(t('teleclase.seleccionarMateria'));
            return;
        }
        if (!selectedTeleclase.descripcion.trim()) {
            alert(t('teleclase.escribirDescripcion'));
            return;
        }

        if (videoFile) {
            const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
            if (!allowedTypes.includes(videoFile.type)) {
                alert(t('teleclase.seleccionarVideo'));
                return;
            }

            const maxSize = 100 * 1024 * 1024;
            if (videoFile.size > maxSize) {
                alert(t('teleclase.errorAgregar'));
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
            console.error(t('teleclase.errorAgregar'), error);
            alert(t('teleclase.errorAgregar'));
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
            console.error(t('teleclase.errorAgregar'), error);
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
            const matchesMateria = materiaSeleccionada === t('teleclase.todas') || teleclase.materia === materiaSeleccionada;
            return matchesSearch && matchesMateria;
        });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTeleclases = filteredTeleclases.slice(indexOfFirstItem, indexOfLastItem);

    const openEditModal = (teleclase) => {
        setSelectedTeleclase(teleclase);
        setShowEditModal(true);
    };

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
        doc.text(t('teleclase.reportes'), doc.internal.pageSize.width / 2, 18, 'center');

        const columnas = [
            "#",
            t('teleclase.titulo'),
            t('teleclase.materia'),
            t('teleclase.descripcion')
        ];

        const datos = teleclases.map((teleclase, index) => [
            index + 1,
            teleclase.titulo,
            teleclase.materia,
            teleclase.descripcion
        ]);

        doc.autoTable({
            head: [columnas],
            body: datos,
            startY: 40,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [28, 41, 51],
                textColor: 255,
                fontSize: 12,
                fontStyle: 'bold',
            },
        });

        const dia = String(new Date().getDate()).padStart(2, '0');
        const mes = String(new Date().getMonth() + 1).padStart(2, '0');
        const anio = new Date().getFullYear();
        doc.save(`Reporte_Teleclases_${dia}-${mes}-${anio}.pdf`);
    };

    const exportarExcelTeleclases = () => {
        const datos = teleclases.map((teleclase, index) => ({
            "#": index + 1,
            [t('teleclase.titulo')]: teleclase.titulo,
            [t('teleclase.materia')]: teleclase.materia,
            [t('teleclase.descripcion')]: teleclase.descripcion,
        }));

        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Teleclases");

        const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

        const dia = String(new Date().getDate()).padStart(2, '0');
        const mes = String(new Date().getMonth() + 1).padStart(2, '0');
        const anio = new Date().getFullYear();
        const nombreArchivo = `Reporte_Teleclases_${dia}-${mes}-${anio}.xlsx`;

        saveAs(blob, nombreArchivo);
    };

    return (
        <div className="contenedor-teleclase-mined">
            <BuscadorTeleclases onSearch={handleSearch} />

            <div className="botones-filtro">
                {materias.map((materia, index) => (
                    <button 
                        key={index}
                        onClick={() => handleMateriaFilter(materia)}
                        className={materiaSeleccionada === materia ? 'active' : ''}
                    >
                        {materia}
                    </button>
                ))}
            </div>

            <div className="d-flex justify-content-center gap-2 mb-3">
                <button className="btn-agregar" onClick={generarPDFTeleclases}>
                    <i className="bi bi-file-earmark-arrow-down"></i> {t('teleclase.generarReportePDF')}
                </button>
                <button className="btn-agregar" onClick={exportarExcelTeleclases}>
                    <i className="bi bi-file-earmark-excel"></i> {t('teleclase.generarReporteExcel')}
                </button>
                <button className="btn-agregar" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg"></i> {t('teleclase.agregarTeleclase')}
                </button>
            </div>

            <div className="catalogo-teleclases">
                <Container fluid>
                    <Row>
                        {currentTeleclases.map((teleclase) => (
                            <TarjetaTeleclasesMINED 
                                key={teleclase.id} 
                                teleclase={teleclase}
                                onEdit={() => openEditModal(teleclase)}
                                onDelete={() => openDeleteModal(teleclase)}
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

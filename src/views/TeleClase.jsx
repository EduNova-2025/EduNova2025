import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/TeleClase.css';
import { db, storage } from '../database/firebaseconfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ModalRegistroTeleclases from '../components/teleclases/ModalRegistroTeleclases';
import TarjetaTeleclases from '../components/teleclases/TarjetaTeleclases';
import BuscadorTeleclases from '../components/teleclases/BuscadorTeleclases';
import { Row, Container } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Paginacion from '../components/ordenamiento/Paginacion';
import ModalQR from '../components/qr/ModalQR';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const TeleClase = () => {
    const { t } = useTranslation();
    const [teleclases, setTeleclases] = useState([]);
    const [materias, setMaterias] = useState([t('teleclase.todas')]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(t('teleclase.todas'));
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [nuevaTeleclase, setNuevaTeleclase] = useState({
        titulo: '',
        materia: '',
        descripcion: '',
        videoUrl: '',
    });
    const [videoFile, setVideoFile] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState('');

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
        if (!nuevaTeleclase.titulo || !nuevaTeleclase.descripcion || !videoFile) {
            alert(t('teleclase.completarCampos'));
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
        }
    };

    const handleVerTeleclase = (teleclase) => {
        // No se envía evento personalizado aquí
    };

    const handleSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const handleMateriaFilter = (materia) => {
        setMateriaSeleccionada(materia);
        setCurrentPage(1);
    };

    const handleShowQR = (videoUrl) => {
        setQrUrl(videoUrl);
        setShowQR(true);
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

    const filteredTeleclases = teleclases
        .filter(teleclase => {
            const matchesSearch = teleclase.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMateria = materiaSeleccionada === t('teleclase.todas') || teleclase.materia === materiaSeleccionada;
            return matchesSearch && matchesMateria;
        });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTeleclases = filteredTeleclases.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="contenedor-principal">
            <div className="contenedor-teleclase">
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
                </div>

                <div className="catalogo-teleclases">
                    <Container fluid>
                        <Row>
                            {currentTeleclases.map((teleclase) => (
                                <TarjetaTeleclases
                                    key={teleclase.id}
                                    teleclase={teleclase}
                                    openEditModal={() => { }}
                                    onVerTeleclase={() => handleVerTeleclase(teleclase)}
                                    onShowQR={handleShowQR}
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
            </div>

            <ModalRegistroTeleclases
                showModal={showModal}
                setShowModal={setShowModal}
                nuevaTeleclase={nuevaTeleclase}
                handleInputChange={handleInputChange}
                handleVideoChange={handleVideoChange}
                handleAddTeleclase={handleAddTeleclase}
            />

            <ModalQR
                show={showQR}
                onHide={() => setShowQR(false)}
                qrUrl={qrUrl}
            />
        </div>
    );
};

export default TeleClase;

/* <button onClick={() => setShowModal(true)}>Agregar Teleclase</button>*/

/*<aside className={`menu-lateral ${menuExpanded ? 'expanded' : ''}`}>
<button className="menu-toggle" onClick={() => setMenuExpanded(!menuExpanded)}>
    <i className={`bi ${menuExpanded ? 'bi-x-lg' : 'bi-list'}`}></i>
</button>
<div className="menu-items">
    <button className="menu-button">
        <i className="bi bi-clock-history"></i>
        <span>Historial</span>
    </button>
    <button className="menu-button">
        <i className="bi bi-clock"></i>
        <span>Ver más tarde</span>
    </button>
</div>
</aside>*/
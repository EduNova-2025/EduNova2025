import React, { useState, useEffect } from 'react';
import '../styles/TeleClase.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { db, storage, analytics } from '../database/firebaseconfig';
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
import { logEvent } from 'firebase/analytics';

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
            logEvent(analytics, 'registro_teleclase', { accion: 'registro', origen: 'teleclases' });
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
            logEvent(analytics, 'actualizacion_teleclase', { accion: 'actualizacion', origen: 'teleclases' });
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
            logEvent(analytics, 'eliminacion_teleclase', { accion: 'eliminacion', origen: 'teleclases' });
            setShowDeleteModal(false);
            setSelectedTeleclase(null);
            await fetchData();
        } catch (error) {
            console.error('Error al eliminar teleclase:', error);
        }
    };

    const handleSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        logEvent(analytics, 'busqueda_teleclase', { termino: searchTerm });
    };

    const handleMateriaFilter = (materia) => {
        setMateriaSeleccionada(materia);
        setCurrentPage(1);
        logEvent(analytics, 'filtrar_teleclase', { materia });
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
        logEvent(analytics, 'ver_teleclase', { id: teleclase.id, titulo: teleclase.titulo });
        setSelectedTeleclase(teleclase);
        setShowEditModal(true);
    };

    // Evento: Visualización de teleclase (eliminación)
    const openDeleteModal = (teleclase) => {
        logEvent(analytics, 'ver_teleclase', { id: teleclase.id, titulo: teleclase.titulo });
        setSelectedTeleclase(teleclase);
        setShowDeleteModal(true);
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
            <button className="btn-agregar" onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-lg"></i> Agregar Teleclase
            </button>
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

import React, { useState, useEffect } from 'react';
import '../styles/TeleClase.css';
import { db, storage } from '../database/firebaseconfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ModalRegistroTeleclases from '../components/teleclases/ModalRegistroTeleclases';
import TarjetaTeleclasesMINED from '../components/teleclases/TarjetaTeleclaseMINED';
import { Row, Container } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ModalEdicionTeleclases from '../components/teleclases/ModalEdicionTeleclases';
import ModalEliminacionTeleclases from '../components/teleclases/ModalEliminacionTeleclases';

const TeleClaseMINED = () => {
    const [teleclases, setTeleclases] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTeleclase, setSelectedTeleclase] = useState(null);
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
        if (!nuevaTeleclase.titulo || !nuevaTeleclase.descripcion || !videoFile) {
            alert('Por favor, completa todos los campos y selecciona un video.');
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
        }
    };

    const handleEditTeleclase = async () => {
        if (!selectedTeleclase) return;

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

    return (
        <div className="contenedor-teleclase-mined" style={{ marginTop: '15px' }}> 
            <div className="busqueda-contenedor">
                <span className="titulo-busqueda">Teleclases</span>
                <div className="campo-busqueda-container">
                    <input type="text" placeholder="Buscar" className="campo-busqueda" />
                </div>
            </div>
            <div className="botones-filtro">
                <button>Todos</button>
                <button>Matemáticas</button>
                <button>Lengua y Literatura</button>
                <button>Inglés</button>
            </div>
            <button className="btn-agregar" onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-lg"></i> Agregar Teleclase
            </button>
            <div className="catalogo-teleclases">
                <Container fluid>
                    <Row>
                        {teleclases.map((teleclase) => (
                            <TarjetaTeleclasesMINED 
                                key={teleclase.id} 
                                teleclase={teleclase}
                                onEdit={() => {
                                    setSelectedTeleclase(teleclase);
                                    setShowEditModal(true);
                                }}
                                onDelete={() => {
                                    setSelectedTeleclase(teleclase);
                                    setShowDeleteModal(true);
                                }}
                            />
                        ))}
                    </Row>
                </Container>
            </div>
            
            {/* Modales */}
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
            />
        </div>
    );
};

export default TeleClaseMINED;

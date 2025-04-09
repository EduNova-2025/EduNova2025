import React, { useState, useEffect } from 'react';
import '../styles/TeleClase.css';
import { db, storage } from '../database/firebaseconfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ModalRegistroTeleclases from '../components/teleclases/ModalRegistroTeleclases';
import TarjetaTeleclases from '../components/teleclases/TarjetaTeleclases';
import BuscadorTeleclases from '../components/teleclases/BuscadorTeleclases';
import { Row, Container } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TeleClase = () => {
    const [teleclases, setTeleclases] = useState([]);
    const [materias, setMaterias] = useState(['Todos']);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [nuevaTeleclase, setNuevaTeleclase] = useState({
        titulo: '',
        materia: '',
        descripcion: '',
        videoUrl: '',
    });
    const [videoFile, setVideoFile] = useState(null);
    const [menuExpanded, setMenuExpanded] = useState(false);

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

    const handleSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
    };

    const filteredTeleclases = teleclases
        .filter(teleclase => {
            const matchesSearch = teleclase.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMateria = materiaSeleccionada === 'Todos' || teleclase.materia === materiaSeleccionada;
            return matchesSearch && matchesMateria;
        });

    return (
        <div className="contenedor-principal">
            <aside className={`menu-lateral ${menuExpanded ? 'expanded' : ''}`}>
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
            </aside>
            <div className="contenedor-teleclase">
                <BuscadorTeleclases onSearch={handleSearch} />
                <div className="botones-filtro">
                    {materias.map((materia, index) => (
                        <button 
                            key={index}
                            onClick={() => setMateriaSeleccionada(materia)}
                            className={materiaSeleccionada === materia ? 'active' : ''}
                        >
                            {materia}
                        </button>
                    ))}
                </div>
               
                <div className="catalogo-teleclases">
                    <Container fluid>
                        <Row>
                            {filteredTeleclases.map((teleclase) => (
                                <TarjetaTeleclases 
                                    key={teleclase.id} 
                                    teleclase={teleclase} 
                                    openEditModal={() => { /* Implementar lógica de edición si es necesario */ }} 
                                />
                            ))}
                        </Row>
                    </Container>
                </div>
                <ModalRegistroTeleclases
                    showModal={showModal}
                    setShowModal={setShowModal}
                    nuevaTeleclase={nuevaTeleclase}
                    handleInputChange={handleInputChange}
                    handleVideoChange={handleVideoChange}
                    handleAddTeleclase={handleAddTeleclase}
                />
            </div>
        </div>
    );
};

export default TeleClase;

/* <button onClick={() => setShowModal(true)}>Agregar Teleclase</button>*/
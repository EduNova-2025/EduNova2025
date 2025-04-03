// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import { db, storage } from "../database/firebaseconfig";
import { useNavigate } from "react-router-dom";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import TablaLibros from "../components/books/TableBooks";
import ModalRegistroLibro from "../components/books/ModalRecordBook";
import ModalEdicionLibro from "../components/books/ModalEditionBook";
import ModalEliminacionLibro from "../components/books/ModalDeleteBook";
import { useAuth } from "../database/authcontext";

const Libros = () => {
    // Estados para manejo de datos
    const [libros, setLibros] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [nuevoLibro, setNuevoLibro] = useState({
        titulo: "",
        descripcion: "",
        area_edu: "",
        edicion: "",
        dirigido: "",
        imagen: "",
        pdfUrl: "",
    });
    const [libroEditado, setLibroEditado] = useState(null);
    const [libroAEliminar, setLibroAEliminar] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [error, setError] = useState(null);

    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // Referencia a las colecciones en Firestore
    const librosCollection = collection(db, "libros");

    // Función para obtener todos los libros de Firestore
    const fetchData = async () => {
        try {
            const librosData = await getDocs(librosCollection);
            const fetchedLibros = librosData.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            }));
            setLibros(fetchedLibros);
        } catch (error) {
            console.error("Error al obtener datos:", error);
            setError("Error al cargar los datos. Intenta de nuevo.");
        }
        };

    // Hook useEffect para carga inicial de datos
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        } else {
        fetchData();
        }
    }, [isLoggedIn, navigate]);

    // Manejador de cambios en inputs del formulario de nuevo libro
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoLibro((prev) => ({ ...prev, [name]: value }));
    };

    // Manejador de cambios en inputs del formulario de edición
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setLibroEditado((prev) => ({ ...prev, [name]: value }));
    };

    // Manejador para la carga de imágenes
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNuevoLibro((prev) => ({ ...prev, imagen: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            alert("Por favor, selecciona una imagen válida.");
        }
    };

    //Manejador para la carga de archivos .pdf
        const handlePdfChange = (e) => {
            const file = e.target.files[0];
            if (file && file.type === "application/pdf") {
            setPdfFile(file);
            } else {
            alert("Por favor, selecciona un archivo PDF.");
            }
        };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLibroEditado((prev) => ({ ...prev, imagen: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            alert("Por favor, selecciona una imagen válida.");
        }
    };

        const handleEditPdfChange = (e) => {
            const file = e.target.files[0];
            if (file && file.type === "application/pdf") {
            setPdfFile(file);
            } else {
            alert("Por favor, selecciona un archivo PDF.");
            }
        };

    // Función para agregar un nuevo libro (CREATE)
        const handleAddLibro = async () => {
            if (!isLoggedIn) {
            alert("Debes iniciar sesión para agregar un libro.");
            navigate("/login");
            return;
            }
        
            if (
            !nuevoLibro.titulo ||
            !nuevoLibro.descripcion ||
            !nuevoLibro.area_edu ||
            !nuevoLibro.edicion ||
            !nuevoLibro.dirigido ||
            !nuevoLibro.imagen ||
            !pdfFile
            ) {
            alert("Por favor, completa todos los campos y selecciona una imagen y un archivo PDF.");
            return;
            }
            try {
            const storageRef = ref(storage, `libros/${pdfFile.name}`);
            await uploadBytes(storageRef, pdfFile);
            const pdfUrl = await getDownloadURL(storageRef);
        
            await addDoc(librosCollection, { ...nuevoLibro, pdfUrl });
            setShowModal(false);
            setNuevoLibro({ titulo: "", descripcion: "", area_edu: "", edicion: "", dirigido: "", imagen:"", pdfUrl: "" });
            setPdfFile(null);
            } catch (error) {
            console.error("Error al agregar libro:", error);
            setError("Error al agregar el libro. Intenta de nuevo.");
            }
        };

    // Función para actualizar un libro existente (UPDATE)
    const handleEditLibro = async () => {
        if (!isLoggedIn) {
            alert("Debes iniciar sesión para editar un libro.");
            navigate("/login");
            return;
            }
        
            if (!libroEditado.titulo || !libroEditado.area_edu || 
                !libroEditado.descripcion || !libroEditado.edicion || !libroEditado.dirigido ) {
            alert("Por favor, completa todos los campos requeridos.");
            return;
            }
            try {
            const libroRef = doc(db, "libros", libroEditado.id);
            if (pdfFile) {
                if (libroEditado.pdfUrl) {
                const oldPdfRef = ref(storage, libroEditado.pdfUrl);
                await deleteObject(oldPdfRef).catch((error) => {
                    console.error("Error al eliminar el PDF anterior:", error);
                });
                }
                const storageRef = ref(storage, `libros/${pdfFile.name}`);
                await uploadBytes(storageRef, pdfFile);
                const newPdfUrl = await getDownloadURL(storageRef);
                await updateDoc(libroRef, { ...libroEditado, pdfUrl: newPdfUrl });
            } else {
                await updateDoc(libroRef, libroEditado);
            }
            setShowEditModal(false);
            setPdfFile(null);
            await fetchData();
            } catch (error) {
            console.error("Error al actualizar libro:", error);
            setError("Error al actualizar el libro. Intenta de nuevo.");
            }
        };
    
    // Función para eliminar un libro (DELETE)
    const handleDeleteLibro = async () => {
        if (!isLoggedIn) {
            alert("Debes iniciar sesión para eliminar un libro.");
            navigate("/login");
            return;
            }
        
            if (libroAEliminar) {
            try {
                const libroRef = doc(db, "libros", libroAEliminar.id);
                if (libroAEliminar.pdfUrl) {
                const pdfRef = ref(storage, libroAEliminar.pdfUrl);
                await deleteObject(pdfRef).catch((error) => {
                    console.error("Error al eliminar el PDF de Storage:", error);
                });
                }
                await deleteDoc(libroRef);
                setShowDeleteModal(false);
                await fetchData();
            } catch (error) {
                console.error("Error al eliminar libro:", error);
                setError("Error al eliminar el libro. Intenta de nuevo.");
            }
            }
        };

    // Función para abrir el modal de edición con datos prellenados
    const openEditModal = (libro) => {
        setLibroEditado({ ...libro });
        setShowEditModal(true);
    };

    // Función para abrir el modal de eliminación
    const openDeleteModal = (libro) => {
        setLibroAEliminar(libro);
        setShowDeleteModal(true);
    };

    // Renderizado del componente
    return (
        <Container className="mt-5">
            <br />
            <h4>Gestión de Libros</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button className="mb-3" onClick={() => setShowModal(true)}>
                Agregar libro
            </Button>
            <TablaLibros
                libros={libros}
                openEditModal={openEditModal}
                openDeleteModal={openDeleteModal}
            />
            <ModalRegistroLibro
                showModal={showModal}
                setShowModal={setShowModal}
                nuevoLibro={nuevoLibro}
                handleInputChange={handleInputChange}
                handleImageChange={handleImageChange}
                handlePdfChange={handlePdfChange}
                handleAddLibro={handleAddLibro}
            />
            <ModalEdicionLibro
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                libroEditado={libroEditado}
                handleEditInputChange={handleEditInputChange}
                handleEditImageChange={handleEditImageChange}
                handleEditPdfChange={handleEditPdfChange}
                handleEditLibro={handleEditLibro}
            />
            <ModalEliminacionLibro
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                handleDeleteLibro={handleDeleteLibro}
            />
        </Container>
    );
};

export default Libros;

// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import TablaLibros from "../components/books/TableBooks";
import ModalRegistroLibro from "../components/books/ModalRecordBook";
import ModalEdicionLibro from "../components/books/ModalEditionBook";
import ModalEliminacionLibro from "../components/books/ModalDeleteBook";

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
        imagen: ""
    });
    const [libroEditado, setLibroEditado] = useState(null);
    const [libroAEliminar, setLibroAEliminar] = useState(null);

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
            console.error("Error al obtener los libros:", error);
        }
    };

    // Hook useEffect para carga inicial de datos
    useEffect(() => {
        fetchData();
    }, []);

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

    // Función para agregar un nuevo libro (CREATE)
    const handleAddLibro = async () => {
        if (!nuevoLibro.titulo || !nuevoLibro.descripcion || !nuevoLibro.edicion || !nuevoLibro.dirigido || !nuevoLibro.area_edu) {
            alert("Por favor, completa todos los campos requeridos.");
            return;
        }
        try {
            await addDoc(librosCollection, nuevoLibro);
            setShowModal(false);
            setNuevoLibro({ titulo: "", descripcion: "", edicion: "", dirigido: "", area_edu: "", imagen: "" });
            await fetchData();
        } catch (error) {
            console.error("Error al agregar el libro:", error);
        }
    };

    // Función para actualizar un libro existente (UPDATE)
    const handleEditLibro = async () => {
        if (!libroEditado.titulo || !libroEditado.descripcion || !libroEditado.edicion || !libroEditado.dirigido || !libroEditado.area_edu) {
            alert("Por favor, completa todos los campos requeridos.");
            return;
        }
        try {
            const libroRef = doc(db, "libros", libroEditado.id);
            await updateDoc(libroRef, libroEditado);
            setShowEditModal(false);
            await fetchData();
        } catch (error) {
            console.error("Error al actualizar el libro:", error);
        }
    };

    // Función para eliminar un libro (DELETE)
    const handleDeleteLibro = async () => {
        if (libroAEliminar) {
            try {
                const libroRef = doc(db, "libros", libroAEliminar.id);
                await deleteDoc(libroRef);
                setShowDeleteModal(false);
                await fetchData();
            } catch (error) {
                console.error("Error al eliminar el libro:", error);
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
            <Button className="mb-3" onClick={() => setShowModal(true)}>
                Agregar libro
            </Button>
            <TablaLibros
                key={libros.length} // Evita advertencias de React
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
                handleAddLibro={handleAddLibro}
            />
            <ModalEdicionLibro
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                libroEditado={libroEditado}
                handleEditInputChange={handleEditInputChange}
                handleEditImageChange={handleEditImageChange}
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

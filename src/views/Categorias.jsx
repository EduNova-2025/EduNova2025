    // Importaciones
    import React, { useState, useEffect } from "react";
    import { Container, Button, Row, Col } from "react-bootstrap";
    import { db } from "../database/firebaseconfig";
    import {
        collection,
        onSnapshot,
        addDoc,
        updateDoc,
        deleteDoc,
        doc,
    } from "firebase/firestore";
  
    import { useTranslation } from 'react-i18next';

    // Importaciones de componentes personalizados
    import TablaCategorias from "../components/categorias/TablaCategorias";
    import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
    import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
    import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
    import CuadroBusquedas from "../components/busquedas/CuadroBusquedas"; //Importación del componente de búsqueda
    import Paginacion from "../components/ordenamiento/Paginacion";


    const Categorias = () => {
        const { t } = useTranslation();
    
    // Estados para manejo de datos
    const [categorias, setCategorias] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre: "",
        descripcion: "",
    });
    const [categoriaEditada, setCategoriaEditada] = useState(null);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Número de productos por página

    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
    const [searchText, setSearchText] = useState("");

    // Referencia a la colección de categorías en Firestore
    const categoriasCollection = collection(db, "categorias");
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Función para obtener todas las categorías de Firestore
    const fetchCategorias = () => {
        const stopListening = onSnapshot(categoriasCollection, (snapshot) => {
            const fetchedCategorias = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setCategorias(fetchedCategorias);
            setCategoriasFiltradas(fetchedCategorias);
            console.log("Categorías cargadas desde Firestore:", fetchedCategorias);
            if (isOffline) {
                console.log("Offline: Mostrando datos desde la caché local.");
            }
            }, (error) => {
            console.error("Error al escuchar categorías:", error);
            if (isOffline) {
                console.log("Offline: Mostrando datos desde la caché local.");
            } else {
                alert("Error al cargar las categorías: " + error.message);
            }
            });
            return stopListening;
        };

        useEffect(() => {
            const handleOnline = () => {
                setIsOffline(false);
                };
                const handleOffline = () => {
                setIsOffline(true);
                };
                window.addEventListener("online", handleOnline);
                window.addEventListener("offline", handleOffline);
                setIsOffline(!navigator.onLine);
                return () => {
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
                };
            }, []);

    // Hook useEffect para carga inicial de datos
    useEffect(() => {
        const cleanupListener = fetchCategorias();
        return () => cleanupListener();
    }, []);

     //Hook useEffect para filtrar categorías según el texto de búsqueda
        const handleSearchChange = (e) => {
        const text = e.target.value.toLowerCase();
        setSearchText(text);
        
        const filtradas = categorias.filter((categoria) => 
            categoria.nombre.toLowerCase().includes(text) || 
            categoria.descripcion.toLowerCase().includes(text) 
        );
    
        setCategoriasFiltradas(filtradas);
    };


    // Manejador de cambios en inputs del formulario de nueva categoría
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    // Manejador de cambios en inputs del formulario de edición
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setCategoriaEditada((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    // Función para agregar una nueva categoría (CREATE)
    const handleAddCategoria = async () => {
        // Cerrar modal
        setShowModal(false);
    
        // Crear ID temporal para offline y objeto de categoría
        const tempId = `temp_${Date.now()}`;
        const categoriaConId = { ...nuevaCategoria, id: tempId };
    
        try {
            // Actualizar estado local para reflejar la nueva categoría
            setCategorias((prev) => [...prev, categoriaConId]);
            setCategoriasFiltradas((prev) => [...prev, categoriaConId]);

            // Limpiar campos del formulario
            setNuevaCategoria({ nombre: "", descripcion: "" });
        
            // Intentar guardar en Firestore
            await addDoc(categoriasCollection, nuevaCategoria);
        
            // Mensaje según estado de conexión
            if (isOffline) {
                console.log("Categoría agregada localmente (sin conexión).");
            } else {
                console.log("Categoría agregada exitosamente en la nube.");
            }
        } catch (error) {
            console.error("Error al agregar la categoría:", error);
        
            // Manejar error según estado de conexión
            if (isOffline) {
                console.log("Offline: Categoría almacenada localmente.");
            } else {
                // Revertir cambios locales si falla en la nube
                setCategorias((prev) => prev.filter((cat) => cat.id !== tempId));
                setCategoriasFiltradas((prev) => prev.filter((cat) => cat.id !== tempId));
                alert("Error al agregar la categoría: " + error.message);
            }
        }
    };

    // Función para actualizar una categoría existente (UPDATE)
    const handleEditCategoria = async () => {
        if (!categoriaEditada?.nombre || !categoriaEditada?.descripcion) {
        alert("Por favor, completa todos los campos antes de actualizar.");
        return;
        }
        
        setShowEditModal(false);
    
        const categoriaRef = doc(db, "categorias", categoriaEditada.id);
    
        try {
        // Intentar actualizar en Firestore
        await updateDoc(categoriaRef, {
            nombre: categoriaEditada.nombre,
            descripcion: categoriaEditada.descripcion,
        });
    
        console.log('Red desconectada:', isOffline )
    
        if (isOffline) {
            // Actualizar estado local inmediatamente si no hay conexión
            setCategorias((prev) =>
            prev.map((cat) =>
                cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
            )
            );
            setCategoriasFiltradas((prev) =>
            prev.map((cat) =>
                cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
            )
            );
            console.log("Categoría actualizada localmente (sin conexión).");
            alert(
            "Sin conexión: Categoría actualizada localmente. Se sincronizará cuando haya internet."
            );
        } else {
            // Si hay conexión, confirmar éxito en la nube
            console.log("Categoría actualizada exitosamente en la nube.");
        }
        } catch (error) {
        // Manejar errores inesperados (no relacionados con la red)
        console.error("Error al actualizar la categoría:", error);
        setCategorias((prev) =>
            prev.map((cat) =>
            cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
            )
        );
        setCategoriasFiltradas((prev) =>
            prev.map((cat) =>
            cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
            )
        );
        alert("Ocurrió un error al actualizar la categoría: " + error.message);
        }
    };

    // Función para eliminar una categoría (DELETE)
    const handleDeleteCategoria = async () => {
        if (!categoriaAEliminar) return;
    
        // Cerrar modal
        setShowDeleteModal(false);
    
        try {
        // Actualizar estado local para reflejar la eliminación
        setCategorias((prev) => prev.filter((cat) => cat.id !== categoriaAEliminar.id));
        setCategoriasFiltradas((prev) => prev.filter((cat) => cat.id !== categoriaAEliminar.id));
    
        // Intentar eliminar en Firestore
        const categoriaRef = doc(db, "categorias", categoriaAEliminar.id);
        await deleteDoc(categoriaRef);
    
        // Mensaje según estado de conexión
        if (isOffline) {
            console.log("Categoría eliminada localmente (sin conexión).");
        } else {
            console.log("Categoría eliminada exitosamente en la nube.");
        }
        } catch (error) {
        console.error("Error al eliminar la categoría:", error);
    
        // Manejar error según estado de conexión
        if (isOffline) {
            console.log("Offline: Eliminación almacenada localmente.");
        } else {
            // Restaurar categoría en estado local si falla en la nube
            setCategorias((prev) => [...prev, categoriaAEliminar]);
            setCategoriasFiltradas((prev) => [...prev, categoriaAEliminar]);
            alert("Error al eliminar la categoría: " + error.message);
        }
        }
    };

    // Calcular categorias paginados
    const paginatedCategorias = categoriasFiltradas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Función para abrir el modal de edición con datos prellenados
    const openEditModal = (categoria) => {
        setCategoriaEditada({ ...categoria });
        setShowEditModal(true);
    };

    // Función para abrir el modal de eliminación
    const openDeleteModal = (categoria) => {
        setCategoriaAEliminar(categoria);
        setShowDeleteModal(true);
    };

    // Renderizado del componente
    return (
        <Container className="mt-4">
        <br />
        <h4 className="title-gestion">{t('categorias.titulo')}</h4>
        <Row className="align-items-center mb-4 g-2">
        {/* Cuadro de búsqueda */}
        <Col xs={12} md={8}>
            <CuadroBusquedas
            searchText={searchText}
            handleSearchChange={handleSearchChange}
            />
        </Col>

        {/* Botón Agregar categoría */}
        <Col xs={12} md={4} className="text-md-end">
            <Button
            className="btn-agregar w-100"
            onClick={() => setShowModal(true)}
            >
            <i className="bi bi-plus-lg me-2"></i> {t('categorias.agregarCategoria')}
            </Button>
        </Col>
        </Row>

        
        <TablaCategorias
            categorias={categoriasFiltradas}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            Categorias={paginatedCategorias} // Pasar categorias paginados
            totalItems={categorias.length} // Total de categorias
            itemsPerPage={itemsPerPage}   // Elementos por página
            currentPage={currentPage}     // Página actual
            setCurrentPage={setCurrentPage} // Método para cambiar página
        />
        <div className="pagination">
        <Paginacion
            itemsPerPage={itemsPerPage}
            totalItems={categoriasFiltradas.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
        />
        </div>
        <ModalRegistroCategoria
            showModal={showModal}
            setShowModal={setShowModal}
            nuevaCategoria={nuevaCategoria}
            handleInputChange={handleInputChange}
            handleAddCategoria={handleAddCategoria}
        />
        <ModalEdicionCategoria
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            categoriaEditada={categoriaEditada}
            handleEditInputChange={handleEditInputChange}
            handleEditCategoria={handleEditCategoria}
        />
        <ModalEliminacionCategoria
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            handleDeleteCategoria={handleDeleteCategoria}
        />
        </Container>
    );
    };

    export default Categorias;
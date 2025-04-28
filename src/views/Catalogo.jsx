    import React, { useState, useEffect } from "react";
    import { Container, Row, Form, Col } from "react-bootstrap";
    import { db } from "../database/firebaseconfig";
    import { collection, getDocs } from "firebase/firestore";
    import TarjetaLibro from "../components/catalogo/TarjetaLibro";
    import Paginacion from "../components/ordenamiento/Paginacion";
    import "../styles/Catalogo.css";

    const Catalogo = () => {
    const [libros, setLibros] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Número de libros por página

    const librosCollection = collection(db, "libros");
    const categoriasCollection = collection(db, "categorias");

    useEffect(() => {
        const fetchData = async () => {
        try {
            const librosData = await getDocs(librosCollection);
            const fetchedLibros = librosData.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            }));
            setLibros(fetchedLibros);

            const categoriasData = await getDocs(categoriasCollection);
            const fetchedCategorias = categoriasData.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            }));
            setCategorias(fetchedCategorias);
        } catch (error) {
            console.error("Error al obtener datos:", error);
        }
        };

        fetchData();
    }, []);

    // Manejador de búsqueda
    const handleSearchChange = (e) => {
        setSearchText(e.target.value.toLowerCase());
        setCurrentPage(1); // Reiniciar a la página 1 cuando buscas
    };

    // Filtrado por búsqueda y categoría
    const librosFiltrados = libros.filter((libro) => {
        const coincideCategoria =
        categoriaSeleccionada === "Todas" || libro.categoria === categoriaSeleccionada;

        const coincideBusqueda =
        libro.titulo.toLowerCase().includes(searchText) ||
        libro.descripcion.toLowerCase().includes(searchText) ||
        libro.categoria.toLowerCase().includes(searchText) ||
        libro.edicion.toLowerCase().includes(searchText) ||
        libro.dirigido.toLowerCase().includes(searchText) ||
        libro.area_edu.toLowerCase().includes(searchText);

        return coincideCategoria && coincideBusqueda;
    });

    // Calcular productos paginados
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedLibros = librosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <Container>
        <br />
        <h4 className="title-gestion">Catálogo de Libros</h4>

        <Row className="g-3 align-items-end">
            <Col lg={4} md={6} sm={12}>
            <Form.Group controlId="categoria">
                <Form.Label className="fw-semibold">Categoría:</Form.Label>
                <Form.Select
                value={categoriaSeleccionada}
                onChange={(e) => {
                    setCategoriaSeleccionada(e.target.value);
                    setCurrentPage(1); // Reiniciar a la página 1 cuando cambias categoría
                }}
                >
                <option value="Todas">Todas</option>
                {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.nombre}>
                    {categoria.nombre}
                    </option>
                ))}
                </Form.Select>
            </Form.Group>
            </Col>

            <Col lg={4} md={6} sm={12}>
            <Form.Group controlId="busqueda">
                <Form.Label className="fw-semibold">Buscar:</Form.Label>
                <Form.Control
                type="text"
                placeholder="Buscar libro..."
                value={searchText}
                onChange={handleSearchChange}
                />
            </Form.Group>
            </Col>
        </Row>

        <Row>
            {paginatedLibros.length > 0 ? (
            paginatedLibros.map((libro) => (
                <TarjetaLibro key={libro.id} libro={libro} />
            ))
            ) : (
            <p>No hay libros que coincidan con la búsqueda.</p>
            )}
        </Row>

        {librosFiltrados.length > itemsPerPage && (
            <Paginacion
            itemsPerPage={itemsPerPage}
            totalItems={librosFiltrados.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            />
        )}
        </Container>
    );
    };

    export default Catalogo;

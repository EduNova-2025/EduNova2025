    import React, { useState, useEffect } from "react";
    import { Container, Row, Form, Col } from "react-bootstrap";
    import { db } from "../database/firebaseconfig";
    import { collection, getDocs } from "firebase/firestore";
    import TarjetaLibro from "../components/catalogo/TarjetaLibro";
    import "../components/catalogo/Styles.css";

    const Catalogo = () => {
    const [libros, setLibros] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
    const [searchText, setSearchText] = useState("");

    const librosCollection = collection(db, "libros");
    const categoriasCollection = collection(db, "categorias");

    const fetchData = async () => {
        try {
        // Obtener libros
        const librosData = await getDocs(librosCollection);
        const fetchedLibros = librosData.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));
        setLibros(fetchedLibros);

        // Obtener categorías
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

    useEffect(() => {
        fetchData();
    }, []);

    // Manejador de búsqueda
    const handleSearchChange = (e) => {
        setSearchText(e.target.value.toLowerCase());
    };

    // Filtrado por búsqueda y categoría
    const librosFiltrados = libros.filter((libro) => {
        const coincideCategoria =
        categoriaSeleccionada === "Todas" ||
        libro.categoria === categoriaSeleccionada;

        const coincideBusqueda =
        libro.titulo.toLowerCase().includes(searchText) ||
        libro.descripcion.toLowerCase().includes(searchText) ||
        libro.categoria.toLowerCase().includes(searchText) ||
        libro.edicion.toLowerCase().includes(searchText) ||
        libro.dirigido.toLowerCase().includes(searchText) ||
        libro.area_edu.toLowerCase().includes(searchText);

        return coincideCategoria && coincideBusqueda;
    });

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
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
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
            {librosFiltrados.length > 0 ? (
            librosFiltrados.map((libro) => (
                <TarjetaLibro key={libro.id} libro={libro} />
            ))
            ) : (
            <p>No hay libros que coincidan con la búsqueda.</p>
            )}
        </Row>
        </Container>
    );
    };

    export default Catalogo;

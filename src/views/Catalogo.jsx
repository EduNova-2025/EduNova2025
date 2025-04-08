    import React, { useState, useEffect } from "react";
    import { Container, Row, Form, Col } from "react-bootstrap";
    import { db } from "../database/firebaseconfig";
    import { collection, getDocs } from "firebase/firestore";
    import TarjetaLibro from "../components/catalogo/TarjetaLibro";
    import "../components/catalogo/Styles.css"

    const Catalogo= () => {
    const [libros, setLibros] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

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

    // Filtrar libros por categoría
    const librosFiltrados = categoriaSeleccionada === "Todas"
        ? libros
        : libros.filter((libro) => libro.categoria === categoriaSeleccionada);

    return (
        <Container className="mt-5">
        <br />
        <h4>Catálogo de Libros</h4>
        {/* Filtro de categorías */}
        <Row>
            <Col lg={3} md={3} sm={6}>
            <Form.Group className="mb-3">
                <Form.Label>Filtrar por categoría:</Form.Label>
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
        </Row>

        {/* Catálogo de libros filtrados */}
        <Row>
            {librosFiltrados.length > 0 ? (
            librosFiltrados.map((libro) => (
                <TarjetaLibro key={libro.id} libro={libro} />
            ))
            ) : (
            <p>No hay libros en esta categoría.</p>
            )}
        </Row>
        </Container>
    );
    };

    export default Catalogo;
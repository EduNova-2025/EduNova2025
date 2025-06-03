import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import GraficoUsuarios from '../components/estadisticas/GraficoUsuarios';
import '../components/estadisticas/estadisticas.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Estadisticas = () => {
    const { t } = useTranslation();
    const [libros, setLibros] = useState([]);
    const [conferencias, setConferencias] = useState([]);
    const [teleclases, setTeleclases] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener libros
                const librosSnapshot = await getDocs(collection(db, "libros"));
                const librosData = librosSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setLibros(librosData);

              

                // Obtener teleclases
                const teleclasesSnapshot = await getDocs(collection(db, "teleclases"));
                const teleclasesData = teleclasesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTeleclases(teleclasesData);

                // Obtener usuarios
                const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
                const usuariosData = usuariosSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsuarios(usuariosData);
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        fetchData();
    }, []);

    // Datos para el gráfico de libros por categoría
    const librosPorCategoria = libros.reduce((acc, libro) => {
        acc[libro.categoria] = (acc[libro.categoria] || 0) + 1;
        return acc;
    }, {});

    const librosChartData = {
        labels: Object.keys(librosPorCategoria),
        datasets: [
            {
                label: t('estadisticas.librosPorCategoria'),
                data: Object.values(librosPorCategoria),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };



    // Datos para el gráfico de teleclases por materia
    const teleclasesPorMateria = teleclases.reduce((acc, teleclase) => {
        acc[teleclase.materia] = (acc[teleclase.materia] || 0) + 1;
        return acc;
    }, {});

    const teleclasesChartData = {
        labels: Object.keys(teleclasesPorMateria),
        datasets: [
            {
                label: t('estadisticas.teleclasesPorMateria'),
                data: Object.values(teleclasesPorMateria),
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Datos para el gráfico de usuarios por rol
    const usuariosPorRol = usuarios.reduce((acc, usuario) => {
        acc[usuario.rol] = (acc[usuario.rol] || 0) + 1;
        return acc;
    }, {});

    const usuariosChartData = {
        labels: Object.keys(usuariosPorRol),
        datasets: [
            {
                label: t('estadisticas.usuariosPorRol'),
                data: Object.values(usuariosPorRol),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <Container fluid className="estadisticas-container">
            <h4 className="title-gestion">{t('estadisticas.titulo')}</h4>

            <Row className="g-3">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h5>{t('estadisticas.totalLibros')}</h5>
                            <h2>{libros.length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h5>{t('estadisticas.totalTeleclases')}</h5>
                            <h2>{teleclases.length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h5>{t('estadisticas.totalUsuarios')}</h5>
                            <h2>{usuarios.length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-3 mt-4">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h5>{t('estadisticas.librosPorCategoria')}</h5>
                            <Bar data={librosChartData} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h5>{t('estadisticas.teleclasesPorMateria')}</h5>
                            <Bar data={teleclasesChartData} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h5>{t('estadisticas.usuariosPorRol')}</h5>
                            <Pie data={usuariosChartData} />
                        </Card.Body>
                    </Card>
                </Col>
        
            </Row>
        </Container>
    );
};

export default Estadisticas;

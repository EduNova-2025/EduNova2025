import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../database/firebaseconfig';
import GraficoUsuarios from '../components/estadisticas/GraficoUsuarios';

const Estadisticas = () => {
    const [usuarios, setUsuarios] = useState([]);
    const usuariosCollection = collection(db, 'usuarios');

    useEffect(() => {
        const unsubscribeUsuarios = onSnapshot(usuariosCollection, (snapshot) => {
            const fetchedUsuarios = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setUsuarios(fetchedUsuarios);
        }, (error) => {
            console.error('Error al obtener usuarios:', error);
            alert('Error al obtener usuarios');
        });
        return () => {
            unsubscribeUsuarios();
        }
    }, []);

    return (
        <Container>
            <br />
            <h1>Estadísticas</h1>
            <Row className='mt-4'>
                <Col xs={12} sm={12} md={12} lg={12} className='mt-4'>
                    <GraficoUsuarios usuarios={usuarios} />
                </Col>
            </Row>
        </Container>
    )
}

export default Estadisticas;

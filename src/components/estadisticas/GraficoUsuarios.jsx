import { Card } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoUsuarios = ({ usuarios }) => {
    // Agrupar usuarios por departamento
    const conteoPorDepartamento = usuarios.reduce((acc, usuario) => {
        const depto = usuario.departamento || 'Sin departamento';
        acc[depto] = (acc[depto] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(conteoPorDepartamento);
    const dataValues = Object.values(conteoPorDepartamento);

    const data = {
        labels: labels,
        datasets: [{
            label: 'Cantidad de usuarios',
            data: dataValues,
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Usuarios por departamento' },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Cantidad' },
            },
            x: {
                title: { display: true, text: 'Departamento' },
            },
        },
    };

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <Card>
                <Card.Body>
                    <Card.Title>Usuarios por departamento</Card.Title>
                    <Bar data={data} options={options} />
                </Card.Body>
            </Card>
        </div>
    );
};

export default GraficoUsuarios; 
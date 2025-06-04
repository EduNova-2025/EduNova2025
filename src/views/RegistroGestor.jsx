import { useState } from 'react';
import { registrarUsuario } from '../components/registro/RegistroUsuario';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../database/firebaseconfig';
import { useNavigate } from 'react-router-dom';  // Importar useNavigate
import '../styles/RegistroDocente.css';

export default function RegistroGestor() {
    const [datos, setDatos] = useState({
        nombre: '',
        cedula: '',
        correo: '',
        contrasena: '',
        telefono: '',
        departamento: '',
        municipio: '',
        cargo: '',
        zona: '',
    });

    const departamentos = {
    Managua: ['Managua', 'Ciudad Sandino', 'Tipitapa'],
    León: ['León', 'Nagarote', 'La Paz Centro'],
    Chontales: ['Juigalpa', 'Acoyapa', 'Santo Tomás'],
    Masaya: ['Masaya', 'Nindirí', 'Masatepe'],
    Granada: ['Granada', 'Nandaime'],
    // Agregá más si es necesario
    };


    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();  // Inicializa navigate

    const handleChange = (e) => {
        setDatos({ ...datos, [e.target.name]: e.target.value });
    };

    function validarContrasena(contrasena) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(contrasena);
    }

    async function existeValor(campo, valor) {
        const q = query(collection(db, 'usuarios'), where(campo, '==', valor));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones de campos requeridos
        if (!datos.nombre || !datos.cedula || !datos.correo || !datos.contrasena || 
            !datos.telefono || !datos.departamento || !datos.municipio || 
            !datos.cargo || !datos.zona) {
            setMensaje('Por favor complete todos los campos requeridos');
            return;
        }

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datos.correo)) {
            setMensaje('Por favor ingrese un correo electrónico válido');
            return;
        }

        // Validar formato de cédula
        const cedulaRegex = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
        if (!cedulaRegex.test(datos.cedula)) {
            setMensaje('La cédula debe tener el formato: XXX-XXXXXX-XXXXX');
            return;
        }

        // Validar formato de teléfono
        const telefonoRegex = /^\d{8}$/;
        if (!telefonoRegex.test(datos.telefono)) {
            setMensaje('El teléfono debe tener 8 dígitos');
            return;
        }

        // Validaciones únicas en Firestore
        if (await existeValor('nombre', datos.nombre)) {
            setMensaje('El nombre de usuario ya está en uso.');
            return;
        }
        if (await existeValor('cedula', datos.cedula)) {
            setMensaje('La cédula ya está registrada.');
            return;
        }
        if (await existeValor('telefono', datos.telefono)) {
            setMensaje('El número de teléfono ya está en uso.');
            return;
        }

        // Validación de contraseña
        if (!validarContrasena(datos.contrasena)) {
            setMensaje('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.');
            return;
        }

        try {
            await registrarUsuario({ ...datos, rol: 'Mined' });
            setMensaje('¡Gestor educativo registrado con éxito!');
            setDatos({
                nombre: '',
                cedula: '',
                correo: '',
                contrasena: '',
                telefono: '',
                departamento: '',
                municipio: '',
                cargo: '',
                zona: '',
            });
            navigate('/inicio');
        } catch (error) {
            if (error.message.includes('email-already-in-use')) {
                setMensaje('El correo electrónico ya está registrado.');
            } else {
                setMensaje(error.message);
            }
        }
    };

    return (
        <div className="registro-docente-wrapper">
        <div className="registro-docente-container">
            <h2 className="registro-docente-titulo">Registrarse</h2>
            <form onSubmit={handleSubmit} className="registro-docente-formulario">
                <div className="form-group">
                    <input 
                        name="nombre" 
                        placeholder="Nombre completo" 
                        value={datos.nombre} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-2 border rounded" 
                    />
                    <small className="text-muted">Ingrese su nombre completo</small>
                </div>

                <div className="form-group">
                    <input 
                        name="cedula" 
                        placeholder="Cédula" 
                        value={datos.cedula} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-2 border rounded" 
                    />
                    <small className="text-muted">Formato: XXX-XXXXXX-XXXXX</small>
                </div>

                <div className="form-group">
                    <input 
                        name="correo" 
                        type="email" 
                        placeholder="Correo electrónico" 
                        value={datos.correo} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-2 border rounded" 
                    />
                    <small className="text-muted">Ejemplo: usuario@dominio.com</small>
                </div>

                <div className="form-group">
                    <input 
                        name="contrasena" 
                        type="password" 
                        placeholder="Contraseña" 
                        value={datos.contrasena} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-2 border rounded" 
                    />
                    <small className="text-muted">Mínimo 8 caracteres, una mayúscula, un número y un símbolo</small>
                </div>

                <div className="form-group">
                    <input 
                        name="telefono" 
                        placeholder="Teléfono" 
                        value={datos.telefono} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-2 border rounded" 
                    />
                    <small className="text-muted">8 dígitos sin espacios ni guiones</small>
                </div>

                <div className="form-group">
                    <select 
                        name="departamento" 
                        value={datos.departamento} 
                        onChange={handleChange} 
                        required
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Selecciona un departamento</option>
                        {Object.keys(departamentos).map(dep => (
                            <option key={dep} value={dep}>{dep}</option>
                        ))}
                    </select>
                    <small className="text-muted">Seleccione su departamento</small>
                </div>

                <div className="form-group">
                    <select 
                        name="municipio" 
                        value={datos.municipio} 
                        onChange={handleChange} 
                        required 
                        disabled={!datos.departamento}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Selecciona un municipio</option>
                        {departamentos[datos.departamento]?.map(mun => (
                            <option key={mun} value={mun}>{mun}</option>
                        ))}
                    </select>
                    <small className="text-muted">Seleccione su municipio</small>
                </div>

                <div className="form-group">
                    <input 
                        name="cargo" 
                        placeholder="Cargo" 
                        value={datos.cargo} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-2 border rounded" 
                    />
                    <small className="text-muted">Ingrese su cargo actual</small>
                </div>

                <div className="form-group">
                    <select 
                        name="zona" 
                        value={datos.zona} 
                        onChange={handleChange} 
                        required
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Selecciona zona</option>
                        <option value="Rural">Rural</option>
                        <option value="Urbana">Urbana</option>
                    </select>
                    <small className="text-muted">Seleccione su zona de trabajo</small>
                </div>

                <button type="submit" className="registro-docente-boton">Registrarse</button>
            </form>
            {mensaje && <div className="mensaje-flotante">{mensaje}</div>}
        </div>
    </div>
    );
}
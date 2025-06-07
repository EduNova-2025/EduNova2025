import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../components/registro/RegistroUsuario';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../database/firebaseconfig';
import '../styles/RegistroDocente.css';

export default function RegistroDocente() {
const navigate = useNavigate();
const [datos, setDatos] = useState({
    nombre: '', cedula: '', correo: '', contrasena: '',
    telefono: '', departamento: '', municipio: '',
    centroEducativo: '', asignaturas: ''
});

const [errores, setErrores] = useState({
    nombre: false,
    cedula: false,
    correo: false,
    contrasena: false,
    telefono: false,
    departamento: false,
    municipio: false,
    centroEducativo: false,
    asignaturas: false
});

const [mensaje, setMensaje] = useState('');
const [formularioValido, setFormularioValido] = useState(false);

const departamentos = {
    Managua: ['Managua', 'Ciudad Sandino', 'Tipitapa'],
    León: ['León', 'Nagarote', 'La Paz Centro'],
    Chontales: ['Juigalpa', 'Acoyapa', 'Santo Tomás'],
    Masaya: ['Masaya', 'Nindirí', 'Masatepe'],
    Granada: ['Granada', 'Nandaime'],
    // Agregá más según necesites
};

const validarCampo = (nombre, valor) => {
    switch (nombre) {
        case 'nombre':
            return valor.length >= 3;
        case 'cedula':
            return /^\d{3}-\d{6}-\d{4}[A-Z]$/.test(valor);
        case 'correo':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
        case 'contrasena':
            return validarContrasena(valor);
        case 'telefono':
            return /^\d{8}$/.test(valor);
        case 'departamento':
            return valor !== '';
        case 'municipio':
            return valor !== '';
        case 'centroEducativo':
            return valor.length >= 5;
        case 'asignaturas':
            return valor.length >= 3;
        default:
            return true;
    }
};

const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
    
    // Validar el campo actual
    const esValido = validarCampo(name, value);
    setErrores(prev => ({ ...prev, [name]: !esValido }));

    // Limpiar municipio si se cambia de departamento
    if (name === 'departamento') {
        setDatos(prev => ({ ...prev, municipio: '' }));
        setErrores(prev => ({ ...prev, municipio: true }));
    }
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
        !datos.centroEducativo || !datos.asignaturas) {
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

    // Validar longitud mínima del nombre
    if (datos.nombre.length < 3) {
        setMensaje('El nombre debe tener al menos 3 caracteres');
        return;
    }

    // Validar formato del centro educativo
    if (datos.centroEducativo.length < 5) {
        setMensaje('El nombre del centro educativo debe tener al menos 5 caracteres');
        return;
    }

    // Validar formato de asignaturas
    if (datos.asignaturas.length < 3) {
        setMensaje('Por favor especifique al menos una asignatura');
        return;
    }

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
    if (!validarContrasena(datos.contrasena)) {
        setMensaje('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.');
        return;
    }

    try {
        await registrarUsuario({ ...datos, rol: 'Docente' });
        setMensaje('¡Docente registrado con éxito!');
        setDatos({
            nombre: '',
            cedula: '',
            correo: '',
            contrasena: '',
            telefono: '',
            departamento: '',
            municipio: '',
            centroEducativo: '',
            asignaturas: ''
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

useEffect(() => {
    // Validar todo el formulario
    const todosLosCamposValidos = Object.keys(datos).every(campo => 
        datos[campo] !== '' && !errores[campo]
    );
    setFormularioValido(todosLosCamposValidos);
}, [datos, errores]);

useEffect(() => {
    if (mensaje) {
    const timer = setTimeout(() => setMensaje(''), 5000);
    return () => clearTimeout(timer);
    }
}, [mensaje]);

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
                        className={errores.nombre ? 'input-error' : ''}
                    />
                    <small className="text-muted">Ingrese su nombre completo (mínimo 3 caracteres)</small>
                </div>

                <div className="form-group">
                    <input 
                        name="cedula" 
                        placeholder="Cédula" 
                        value={datos.cedula} 
                        onChange={handleChange} 
                        required 
                        className={errores.cedula ? 'input-error' : ''}
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
                        className={errores.correo ? 'input-error' : ''}
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
                        className={errores.contrasena ? 'input-error' : ''}
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
                        className={errores.telefono ? 'input-error' : ''}
                    />
                    <small className="text-muted">8 dígitos sin espacios ni guiones</small>
                </div>

                <div className="form-group">
                    <select 
                        name="departamento" 
                        value={datos.departamento} 
                        onChange={handleChange} 
                        required
                        className={errores.departamento ? 'input-error' : ''}
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
                        className={errores.municipio ? 'input-error' : ''}
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
                        name="centroEducativo" 
                        placeholder="Centro educativo" 
                        value={datos.centroEducativo} 
                        onChange={handleChange} 
                        required 
                        className={errores.centroEducativo ? 'input-error' : ''}
                    />
                    <small className="text-muted">Ingrese el nombre completo del centro educativo (mínimo 5 caracteres)</small>
                </div>

                <div className="form-group">
                    <input 
                        name="asignaturas" 
                        placeholder="Asignaturas que imparte" 
                        value={datos.asignaturas} 
                        onChange={handleChange} 
                        required 
                        className={errores.asignaturas ? 'input-error' : ''}
                    />
                    <small className="text-muted">Ingrese las asignaturas que imparte (mínimo 3 caracteres)</small>
                </div>

                <button 
                    type="submit" 
                    className="registro-docente-boton"
                    disabled={!formularioValido}
                >
                    Registrarse
                </button>
            </form>

            {mensaje && <div className="mensaje-flotante">{mensaje}</div>}
        </div>
    </div>
);
}
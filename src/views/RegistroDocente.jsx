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

    const [mensaje, setMensaje] = useState('');

    const departamentos = {
        Managua: ['Managua', 'Ciudad Sandino', 'Tipitapa'],
        León: ['León', 'Nagarote', 'La Paz Centro'],
        Chontales: ['Juigalpa', 'Acoyapa', 'Santo Tomás'],
        Masaya: ['Masaya', 'Nindirí', 'Masatepe'],
        Granada: ['Granada', 'Nandaime'],
        // Agregá más según necesites
    };

    const handleChange = (e) => {
        setDatos({ ...datos, [e.target.name]: e.target.value });

        // Limpiar municipio si se cambia de departamento
        if (e.target.name === 'departamento') {
        setDatos(prev => ({ ...prev, municipio: '' }));
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
            <input name="nombre" placeholder="Nombre completo" value={datos.nombre} onChange={handleChange} required />
            <input name="cedula" placeholder="Cédula" value={datos.cedula} onChange={handleChange} required />
            <input name="correo" type="email" placeholder="Correo electrónico" value={datos.correo} onChange={handleChange} required />
            <input name="contrasena" type="password" placeholder="Contraseña" value={datos.contrasena} onChange={handleChange} required />
            <input name="telefono" placeholder="Teléfono" value={datos.telefono} onChange={handleChange} required />

            <select name="departamento" value={datos.departamento} onChange={handleChange} required>
                <option value="">Selecciona un departamento</option>
                {Object.keys(departamentos).map(dep => (
                <option key={dep} value={dep}>{dep}</option>
                ))}
            </select>

            <select name="municipio" value={datos.municipio} onChange={handleChange} required disabled={!datos.departamento}>
                <option value="">Selecciona un municipio</option>
                {departamentos[datos.departamento]?.map(mun => (
                <option key={mun} value={mun}>{mun}</option>
                ))}
            </select>

            <input name="centroEducativo" placeholder="Centro educativo" value={datos.centroEducativo} onChange={handleChange} required />
            <input name="asignaturas" placeholder="Asignaturas que imparte" value={datos.asignaturas} onChange={handleChange} required />

            <button type="submit" className="registro-docente-boton">Registrarse</button>
            </form>

            {mensaje && <div className="mensaje-flotante">{mensaje}</div>}
        </div>
        </div>
    );
    }

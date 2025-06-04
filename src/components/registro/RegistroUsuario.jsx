    // src/services/registroUsuario.js
    import { createUserWithEmailAndPassword } from 'firebase/auth';
    import { doc, setDoc } from 'firebase/firestore';
    import { auth, db } from '../../database/firebaseconfig';
    import ReactGA from "react-ga4";

    export async function registrarUsuario(usuario) {
    const {
        nombre,
        cedula,
        correo,
        telefono,
        departamento,
        municipio,
        contrasena,
        rol,
        centroEducativo,
        asignaturas,
        cargo,
        zona,
    } = usuario;

    // Validaciones
    if (!nombre || !cedula || !correo || !contrasena) {
        throw new Error('Por favor complete todos los campos requeridos');
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        throw new Error('Por favor ingrese un correo electrónico válido');
    }

    // Validar contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(contrasena)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo');
    }

    // Validar cédula (asumiendo formato nicaragüense)
    const cedulaRegex = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
    if (!cedulaRegex.test(cedula)) {
        throw new Error('La cédula debe tener el formato: XXX-XXXXXX-XXXXX');
    }

    // Validar teléfono
    const telefonoRegex = /^\d{8}$/;
    if (telefono && !telefonoRegex.test(telefono)) {
        throw new Error('El teléfono debe tener 8 dígitos');
    }

    try {
        const credenciales = await createUserWithEmailAndPassword(auth, correo, contrasena);
        const uid = credenciales.user.uid;

        const datosBase = {
        uid,
        nombre,
        cedula,
        correo,
        telefono,
        departamento,
        municipio,
        rol,
        creado: new Date(),
        };

        let datosFinales = { ...datosBase };

        if (rol === 'Docente') {
        if (!centroEducativo || !asignaturas) {
            throw new Error('Por favor complete los campos específicos del docente');
        }
        datosFinales = {
            ...datosFinales,
            centroEducativo,
            asignaturas,
        };
        } else if (rol === 'Mined') {
        if (!cargo || !zona) {
            throw new Error('Por favor complete los campos específicos del gestor');
        }
        datosFinales = {
            ...datosFinales,
            cargo,
            zona,
        };
        }

        await setDoc(doc(db, 'usuarios', uid), datosFinales);
        // Tracking GA
        ReactGA.event({
            category: "Usuarios",
            action: "Registro de Usuario",
            label: correo,
        });
        return uid;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
        throw new Error('El correo electrónico ya está registrado');
        }
        throw new Error(error.message);
    }
    }

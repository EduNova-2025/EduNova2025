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
        datosFinales = {
            ...datosFinales,
            centroEducativo,
            asignaturas,
        };
        } else if (rol === 'Mined') {
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
        throw new Error(error.message);
    }
    }

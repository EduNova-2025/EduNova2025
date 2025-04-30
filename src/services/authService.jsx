import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { appfirebase } from '../database/firebaseconfig';

const auth = getAuth(appfirebase);
const db = getFirestore(appfirebase);

export const registerUser = async (email, password, username, phoneNumber) => {
    try {
        // Verificar si el correo ya existe en la colección 'usuarios'
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return {
                success: false,
                error: "El correo ya está registrado."
            };
        }

        // Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar información adicional en Firestore
        await setDoc(doc(db, 'usuarios', user.uid), {
            email: email,
            username: username,
            phoneNumber: phoneNumber,
            createdAt: new Date()
        });

        return { success: true };
    } catch (error) {
        return { 
            success: false, 
            error: error.message 
        };
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { 
            success: false, 
            error: error.message 
        };
    }
};

// Register with Google
export const registerWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Verificar si el correo ya existe en la colección 'usuarios'
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Ya existe en Firestore, no registrar de nuevo
            return { success: true, alreadyRegistered: true, user };
        }

        // Si llegó aquí, el usuario existe en Auth pero no en Firestore (o es nuevo)
        // Guardar información adicional en Firestore
        await setDoc(doc(db, 'usuarios', user.uid), {
            email: user.email,
            username: user.displayName || "",
            phoneNumber: user.phoneNumber || "",
            createdAt: new Date()
        }, { merge: true });

        return { success: true, alreadyRegistered: false, user };
    } catch (error) {
        // Si el error es auth/account-exists-with-different-credential, puedes manejarlo aquí
        if (error.code === "auth/account-exists-with-different-credential") {
            return {
                success: false,
                error: "Este correo ya está registrado con otro método. Por favor, inicia sesión con ese método."
            };
        }
        return {
            success: false,
            error: error.message
        };
    }
};
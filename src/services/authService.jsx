import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { appfirebase } from '../database/firebaseconfig';

const auth = getAuth(appfirebase);
const db = getFirestore(appfirebase);

export const registerUser = async (email, password, username, phoneNumber) => {
    try {
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
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { appfirebase } from "./firebaseconfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const auth = getAuth(appfirebase);
    const db = getFirestore(appfirebase);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsLoggedIn(!!user);
      if (user) {
        // Obtener el rol del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().rol || null);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log("¡Conexión restablecida!");
      // Opcional: Mostrar una notificación más amigable (puedes usar un componente de notificación en lugar de alert)
      alert("¡Conexión restablecida!");
    };
    const handleOffline = () => {
      console.log("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
      alert("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const logout = async () => {
    const auth = getAuth(appfirebase);
    await signOut(auth);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, userRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

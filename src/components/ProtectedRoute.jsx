import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";

const ProtectedRoute = ({ element, allowedRoles }) => {
    const { user, userRole } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <div style={{padding: '2rem', textAlign: 'center', color: 'red'}}>Acceso denegado: No tienes permisos para ver esta página.</div>;
    }

    return element;
};

export default ProtectedRoute;
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";
import { useTranslation } from 'react-i18next';


const ProtectedRoute = ({ element, allowedRoles }) => {
    const { user, userRole } = useAuth();
    const { t } = useTranslation();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <div style={{padding: '2rem', textAlign: 'center', color: 'red'}}>{t('protectedRoute.accesoDenegado')}</div>;
    }

    return element;
};

export default ProtectedRoute;
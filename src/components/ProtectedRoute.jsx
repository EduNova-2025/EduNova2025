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
        return (
            <div className="access-denied">
                <h2>{t('protectedRoute.accesoDenegado')}</h2>
                <p>{t('protectedRoute.noPermisos')}</p>
            </div>
        );
    }

    return element;
};

export default ProtectedRoute;
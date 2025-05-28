import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { AuthProvider} from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from './views/Login';
import Sidebar from "./components/sidebar/Sidebar";
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import MasterIA from "./views/MasterIA";
import Books from "./views/Books";
import Bienvenida from "./views/Bienvenida";
import TeleClase from "./views/TeleClase";
import TeleClaseMINED from "./views/TeleClaseMINED";
import Categoria from "./views/Categorias";
import Catalogo from "./views/Catalogo";
import Foro from "./views/Foro";
import DetalleLibro from "./views/DetalleLibro";
import Conferencia from "./views/Conferencias";
import HistorialConferencias from "./views/HistorialVideollamadas";
import Roles from "./views/Roles";
import RegistroDocente from "./views/RegistroDocente";
import RegistroGestor from "./views/RegistroGestor";
import Estadisticas from "./views/Estadisticas";

import './App.css';

function AppRoutes() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const location = useLocation();
  const ocultarHamburguesa = location.pathname === "/foro" && grupoSeleccionado;

  return (
    <div className="App">
      <Sidebar ocultarHamburguesa={ocultarHamburguesa} />
      <Encabezado />
      <main>
        <Routes>
          <Route path="/" element={<Bienvenida />} />
          <Route path="/login" element={<Login />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/registro-docente" element={<RegistroDocente />} />
          <Route path="/registro-gestor" element={<RegistroGestor />} />
          <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
          <Route path="/books" element={<ProtectedRoute element={<Books />} allowedRoles={["Admin", "Mined"]} />} />
          <Route path="/categorias" element={<ProtectedRoute element={<Categoria />} allowedRoles={["Admin", "Mined"]} />} />
          <Route path="/catalogo" element={<ProtectedRoute element={<Catalogo />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
          <Route path="/libro/:id" element={<DetalleLibro />} />
          <Route path="/ia" element={<ProtectedRoute element={<MasterIA />} allowedRoles={["Admin", "Docente","Mined"]} />} />
          <Route path="/teleclase" element={<ProtectedRoute element={<TeleClase />} allowedRoles={["Docente", "Admin", "Mined"]} />} />
          <Route path="/teleclasemined" element={<ProtectedRoute element={<TeleClaseMINED />} allowedRoles={["Mined", "Admin"]} />} />
          <Route path="/foro" element={<ProtectedRoute element={<Foro grupoSeleccionado={grupoSeleccionado} setGrupoSeleccionado={setGrupoSeleccionado} />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
          <Route path="/conferencia" element={<ProtectedRoute element={<Conferencia />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
          <Route path="/hisconferencia" element={<ProtectedRoute element={<HistorialConferencias />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
          <Route path="/estadisticas" element={<ProtectedRoute element={<Estadisticas />} allowedRoles={["Admin", "Mined"]} />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

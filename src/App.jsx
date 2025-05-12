import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./database/authcontext";
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
<<<<<<< Updated upstream
import DetalleLibro from "./views/DetalleLibro"; //Importacioón de la vista DetalleLibro
import Conferencia from "./views/Conferencias"; //Importanción de la vista Conferencia
import HistorialConferencias from "./views/HistorialVideollamadas"; //Importación de la vista Conferencias
import Roles from "./views/Roles"; //Importación de la vista Roles para seleccionar el rol
import RegistroDocente from "./views/RegistroDocente"; //Importación de la vista del formulario RegistroDocente
import RegistroGestor from "./views/RegistroGestor"; //Importación de la vista del formulario RegistroGestor
import { useState } from "react";
import { useLocation } from "react-router-dom";
=======
import DetalleLibro from "./views/DetalleLibro";
import Conferencia from "./views/Conferencias";
import HistorialConferencias from "./views/HistorialVideollamadas";
import Roles from "./views/Roles";
import RegistroDocente from "./views/RegistroDocente";
import RegistroGestor from "./views/RegistroGestor";
>>>>>>> Stashed changes

import './App.css';

<<<<<<< Updated upstream
function AppRoutes() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const location = useLocation();
  // Ocultar hamburguesa solo en /foro y cuando hay chat seleccionado
  const ocultarHamburguesa = location.pathname === "/foro" && grupoSeleccionado;

  return (
    <div className="App">
      <Sidebar ocultarHamburguesa={ocultarHamburguesa} />
      <Encabezado />
      <main>
        <Routes>
          <Route path="/" element={<Bienvenida />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/roles"  element={<Roles />} />
          <Route path="/registro-docente"  element={<RegistroDocente />} />
          <Route path="/registro-gestor"  element={<RegistroGestor />} />
          <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
          <Route path="/books" element={<ProtectedRoute element={<Books />} allowedRoles={["Admin","Mined"]} />}/>
          <Route path="/categorias" element={<ProtectedRoute element={<Categoria />} allowedRoles={["Admin","Mined"]} />}/>
          <Route path="/catalogo" element={<ProtectedRoute element={<Catalogo/>} allowedRoles={["Docente", "Mined", "Admin"]} />}/>
          <Route path="/libro/:id" element={<DetalleLibro />} />
          <Route path="/ia" element={<ProtectedRoute element={<MasterIA />} allowedRoles={["Admin","Mined"]} />}/>
          <Route path="/teleclase" element={<ProtectedRoute element={<TeleClase />} allowedRoles={["Docente", "Admin","Mined"]} />}/>
          <Route path="/teleclasemined" element={<ProtectedRoute element={<TeleClaseMINED />} allowedRoles={["Mined", "Admin"]} />}/>
          <Route path="/foro" element={<ProtectedRoute element={<Foro grupoSeleccionado={grupoSeleccionado} setGrupoSeleccionado={setGrupoSeleccionado} />} allowedRoles={["Docente", "Mined", "Admin"]} />}/>
          <Route path="/conferencia" element={<ProtectedRoute element={<Conferencia />} allowedRoles={["Docente", "Mined", "Admin"]} />}/>
          <Route path="/hisconferencia" element={<ProtectedRoute element={<HistorialConferencias />} allowedRoles={["Docente", "Mined", "Admin"]} />}/>
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
=======
// AppContent ahora accede al contexto
function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <Router>
      <div className="App">
        {isLoggedIn ? <Sidebar /> : <Encabezado />}

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
            <Route path="/ia" element={<ProtectedRoute element={<MasterIA />} allowedRoles={["Admin", "Docente"]} />} />
            <Route path="/teleclase" element={<ProtectedRoute element={<TeleClase />} allowedRoles={["Docente", "Admin", "Mined"]} />} />
            <Route path="/teleclasemined" element={<ProtectedRoute element={<TeleClaseMINED />} allowedRoles={["Mined", "Admin"]} />} />
            <Route path="/foro" element={<ProtectedRoute element={<Foro />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
            <Route path="/conferencia" element={<ProtectedRoute element={<Conferencia />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
            <Route path="/hisconferencia" element={<ProtectedRoute element={<HistorialConferencias />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
          </Routes>
        </main>
      </div>
    </Router>
>>>>>>> Stashed changes
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

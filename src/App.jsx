import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Login from './views/Login'
import Sidebar from "./components/sidebar/Sidebar";
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import MasterIA from "./views/MasterIA"; //Importación de la vista MasterIA
import Books from "./views/Books"; //Importación de la vista Books
import Bienvenida from "./views/Bienvenida";
import TeleClase from "./views/TeleClase";
import TeleClaseMINED from "./views/TeleClaseMINED";
import Categoria from "./views/Categorias"; //Importanción de la vista Categoría
import Catalogo from "./views/Catalogo"; //Importación de la vista Catálogo
import Foro from "./views/Foro";
import DetalleLibro from "./views/DetalleLibro"; //Importacioón de la vista DetalleLibro
import Conferencia from "./views/Conferencias"; //Importanción de la vista Conferencia
import HistorialConferencias from "./views/HistorialVideollamadas"; //Importación de la vista Conferencias

import './App.css'

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <div className="App">
            <Sidebar />
            <Encabezado />
            <main>
              <Routes>
                
                <Route path="/" element={<Bienvenida />} />
                <Route path="/login"  element={<Login />} />
                <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} allowedRoles={["Docente", "Mined", "Admin"]} />} />
                <Route path="/books" element={<ProtectedRoute element={<Books />} allowedRoles={["Admin"]} />}/>
                <Route path="/categorias" element={<ProtectedRoute element={<Categoria />} allowedRoles={["Admin"]} />}/>
                <Route path="/catalogo" element={<ProtectedRoute element={<Catalogo/>} allowedRoles={["Docente", "Mined", "Admin"]} />}/>
                <Route path="/libro/:id" element={<DetalleLibro />} />
                <Route path="/ia" element={<ProtectedRoute element={<MasterIA />} allowedRoles={["Admin"]} />}/>
                <Route path="/teleclase" element={<ProtectedRoute element={<TeleClase />} allowedRoles={["Docente", "Admin"]} />}/>
                <Route path="/teleclasemined" element={<ProtectedRoute element={<TeleClaseMINED />} allowedRoles={["Mined", "Admin"]} />}/>
                <Route path="/foro" element={<ProtectedRoute element={<Foro />} allowedRoles={["Docente", "Mined", "Admin"]} />}/>
                <Route path="/conferencia" element={<ProtectedRoute element={<Conferencia />} allowedRoles={["Docente", "Mined", "Admin"]} />}/>
                <Route path="/hisconferencia" element={<ProtectedRoute element={<HistorialConferencias />} allowedRoles={["Docente", "Mined", "Admin"]} />}/>
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App;
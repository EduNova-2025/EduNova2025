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

import './App.css'

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <div className="App">
          <Encabezado />
            <Sidebar />
            <main>
              <Routes>
                
                <Route path="/" element={<Bienvenida />} />
                <Route path="/login"  element={<Login />} />
                <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
                <Route path="/books" element={<ProtectedRoute element={<Books />} />}/>
                <Route path="/categorias" element={<ProtectedRoute element={<Categoria />} />}/>
                <Route path="/catalogo" element={<ProtectedRoute element={<Catalogo/>} />}/>
                <Route path="/ia" element={<ProtectedRoute element={<MasterIA />} />}/>
                <Route path="/teleclase" element={<ProtectedRoute element={<TeleClase />} />}/>
                <Route path="/teleclasemined" element={<ProtectedRoute element={<TeleClaseMINED />} />}/>
                <Route path="/foro" element={<ProtectedRoute element={<Foro />} />}/>
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
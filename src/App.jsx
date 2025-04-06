import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Login from './views/Login'
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Libros from "./views/Libros";
import MasterIA from "./views/MasterIA";
import TeleClase from "./views/TeleClase"

import './App.css'

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <div className="App">
            <Encabezado />
            <main>
              <Routes>
                
                <Route path="/" element={<Login />} />
                <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
                <Route path="/libros" element={<ProtectedRoute element={<Libros />} />}/>
                <Route path="/ia" element={<ProtectedRoute element={<MasterIA />} />}/>
                <Route path="/teleclase" element={<ProtectedRoute element={<TeleClase />} />}/>
                
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App

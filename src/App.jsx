import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Login from './views/Login'
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import MasterIA from "./views/MasterIA"; //Importación de la vista MasterIA
import Books from "./views/Books"; //Importación de la vista Books
import Bienvenida from "./views/Bienvenida";

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
                
                <Route path="/" element={<Bienvenida />} />
                <Route path="/login"  element={<Login />} />
                <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
                <Route path="/books" element={<ProtectedRoute element={<Books />} />}/>
                <Route path="/ia" element={<ProtectedRoute element={<MasterIA />} />}/>
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App

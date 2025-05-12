import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaBoxOpen,
  FaTags,
  FaRobot,
  FaCog,
  FaSignOutAlt, FaListAlt,
  FaComment,
  FaFolderOpen, FaBook, FaThList, FaVideo,
} from "react-icons/fa";
import { useAuth } from "../../database/authcontext"; // Importar el contexto de autenticación
import "../../styles/Sidebar.css";

const SidebarItem = ({ icon, label, path, active, onClick, isSubmenu }) => (
  <div
    className={`sidebar-item ${active ? "active" : ""} ${isSubmenu ? "submenu" : ""}`}
    onClick={() => onClick(path)}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const Sidebar = ({ ocultarHamburguesa }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const { isLoggedIn, logout, userRole } = useAuth(); // Usamos el rol del usuario

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNavigate = (path) => {
    if (path === "/logout") {
      handleLogout();
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const handleSubmenuToggle = (submenuName) => {
    setOpenSubmenu((prev) => (prev === submenuName ? null : submenuName));
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Definir los items del sidebar según el rol
  const items = [
    { icon: <FaHome />, label: "Inicio", path: "/inicio" },
    {
      icon: <FaBoxOpen />, label: "Biblioteca Digital", submenuName: "biblioteca", subItems: [
        { icon: <FaThList />, label: "Categorías", path: "/categorias", rolesAllowed: ["admin"] }, // Solo para admin
        { icon: <FaBook />, label: "Gestión", path: "/books", rolesAllowed: ["admin"] }, // Solo para admin
        { icon: <FaFolderOpen />, label: "Catálogo", path: "/catalogo" }, // Disponible para todos
      ]
    },
    {
      icon: <FaTags />, label: "Teleclases", submenuName: "teleclase", subItems: [
        { icon: <FaBook />, label: "Gestión", path: "/teleclasemined" },
        { icon: <FaListAlt />, label: "Documentos", path: "/teleclase" },
      ]
    },
    { icon: <FaRobot />, label: "Master IA", path:"/ia" },
    { icon: <FaComment />, label: "Foro", path: "/foro" },
    { icon: <FaVideo />, label: "Conferencias", path: "/conferencia" },
    { icon: <FaCog />, label: "Ajustes", path: "/configuracion" },
  ];

  const bottomItems = [
    { icon: <FaSignOutAlt />, label: "Cerrar Sesión", path: "/logout" },
  ];

  // Filtrar los items del sidebar según el rol
  const filteredItems = items.filter(item => {
    if (userRole === "Admin") {
      return true; // Admin ve todo
    }
    if (userRole === "Docente") {
      // Solo mostrar elementos relevantes para Docente
      return item.label === "Inicio" || item.label === "Biblioteca Digital" || item.label === "Teleclases" || item.label === "Master IA" || item.label === "Foro" || item.label === "Conferencias";
    }
    if (userRole === "Mined") {
      // Solo mostrar elementos relevantes para MINED
      return item.label === "Biblioteca Digital" || item.label === "Teleclases" || item.label === "Master IA";
    }
    return false;
  });

  if (!isLoggedIn) return null;

  return (
    <>
      {!ocultarHamburguesa && (
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      )}

      <div
        className={`modern-sidebar hover-expand ${isOpen ? "open" : ""} ${isHovered ? "open" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sidebar-title">
          <h1>EduNova</h1>
        </div>

        <div className="sidebar-section">
          {filteredItems.map((item) =>
            item.subItems ? (
              <div key={item.label}>
                <SidebarItem
                  {...item}
                  active={location.pathname === item.path}
                  onClick={() => handleSubmenuToggle(item.submenuName)}
                />
                {openSubmenu === item.submenuName && (
                  <div className="submenu">
                    {item.subItems
                      .filter(subItem => subItem.rolesAllowed ? subItem.rolesAllowed.includes(userRole) : true) // Filtrar según el rol
                      .map((subItem) => (
                        <SidebarItem
                          key={subItem.label}
                          {...subItem}
                          active={location.pathname === subItem.path}
                          onClick={handleNavigate}
                          isSubmenu={true}
                        />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <SidebarItem
                key={item.label}
                {...item}
                active={location.pathname === item.path}
                onClick={handleNavigate}
              />
            )
          )}
        </div>

        <div className="sidebar-section bottom">
          {bottomItems.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
              active={location.pathname === item.path}
              onClick={handleNavigate}
            />
          ))}
        </div>
      </div>

      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;

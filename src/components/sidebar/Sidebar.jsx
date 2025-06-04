import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  FaBars,
  FaHome,
  FaBoxOpen,
  FaTags,
  FaRobot,
  FaCog,
  FaSignOutAlt,
  FaListAlt,
  FaComment,
  FaFolderOpen,
  FaBook,
  FaThList,
  FaVideo,
  FaChartBar,
  FaLanguage,
} from "react-icons/fa";
import { useAuth } from "../../database/authcontext";
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
  const { isLoggedIn, logout, userRole } = useAuth();
  const { t, i18n } = useTranslation();

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

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const cambiarIdioma = (lang) => {
    i18n.changeLanguage(lang);
  };

  const items = [
    { icon: <FaHome />, label: t("menu.inicio"), path: "/inicio", rolesAllowed: ["Admin", "Docente", "Mined"] },

    {
      icon: <FaBoxOpen />, label: t("menu.biblioteca"), submenuName: "biblioteca", subItems: [
        { icon: <FaThList />, label: t("menu.categorias"), path: "/categorias", rolesAllowed: ["Admin", "Mined"] },
        { icon: <FaBook />, label: t("menu.libros"), path: "/books", rolesAllowed: ["Admin", "Mined"] },
        { icon: <FaFolderOpen />, label: t("menu.catalogo"), path: "/catalogo", rolesAllowed: ["Admin", "Docente"] },
      ], rolesAllowed: ["Admin", "Docente", "Mined"]
    },

    {
      icon: <FaTags />, label: t("menu.teleclases"), submenuName: "teleclase", subItems: [
        { icon: <FaBook />, label: t("menu.gestion"), path: "/teleclasemined", rolesAllowed: ["Admin", "Mined"] },
        { icon: <FaListAlt />, label: t("menu.documentos"), path: "/teleclase", rolesAllowed: ["Admin", "Docente"] },
      ], rolesAllowed: ["Admin", "Docente", "Mined"]
    },

    { icon: <FaRobot />, label: t("menu.masterIA"), path: "/ia", rolesAllowed: ["Admin", "Docente"] },
    { icon: <FaComment />, label: t("menu.foro"), path: "/foro", rolesAllowed: ["Admin", "Docente", "Mined"] },
    { icon: <FaVideo />, label: t("menu.conferencias"), path: "/conferencia", rolesAllowed: ["Admin", "Docente", "Mined"] },
    { icon: <FaChartBar />, label: t("menu.estadisticas"), path: "/estadisticas", rolesAllowed: ["Admin", "Mined"] },
  ];

  const bottomItems = [
    { icon: <FaSignOutAlt />, label: t("menu.cerrarSesion"), path: "/logout" },
  ];

  const filteredItems = items.filter(item => {
    return !item.rolesAllowed || item.rolesAllowed.includes(userRole);
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
                      .filter(subItem => !subItem.rolesAllowed || subItem.rolesAllowed.includes(userRole))
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
          <div className="language-selector">
            <div className="sidebar-item" onClick={() => cambiarIdioma("es")}>
              <FaLanguage />
              <span>{t("menu.español")}</span>
            </div>
            <div className="sidebar-item" onClick={() => cambiarIdioma("en")}>
              <FaLanguage />
              <span>{t("menu.ingles")}</span>
            </div>
          </div>
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

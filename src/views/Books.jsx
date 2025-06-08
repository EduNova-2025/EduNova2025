// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button, Alert, Col, Row } from "react-bootstrap";
import { db, storage} from "../database/firebaseconfig";
import { useNavigate } from "react-router-dom";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import TablaLibros from "../components/books/TableBooks";
import ModalRegistroLibro from "../components/books/ModalRecordBook";
import ModalEdicionLibro from "../components/books/ModalEditionBook";
import ModalEliminacionLibro from "../components/books/ModalDeleteBook";
import { useAuth } from "../database/authcontext";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas"; //Importación del componente de búsqueda
import Paginacion from "../components/ordenamiento/Paginacion";
import ModalQR from "../components/qr/ModalQR"; //Importación del componente QR
import jsPDF from "jspdf"; 
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

const Libros = () => {
    const { t } = useTranslation();
    // Estados para manejo de datos
    const [libros, setLibros] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [nuevoLibro, setNuevoLibro] = useState({
        titulo: "",
        descripcion: "",
        area_edu: "",
        edicion: "",
        dirigido: "",
        categoria: "",
        imagen: "",
        pdfUrl: "",
    });
    const [libroEditado, setLibroEditado] = useState(null);
    const [libroAEliminar, setLibroAEliminar] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [error, setError] = useState(null);

    const [librosFiltrados, setLibrosFiltrados] = useState([]);
    const [searchText, setSearchText] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Número de libros por página

    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedUrl, setSelectedUrl] = useState("");


    // Referencia a las colecciones en Firestore
    const librosCollection = collection(db, "libros");
    const categoriasCollection = collection(db, "categorias");

    const openQRModal = (url) => {
        setSelectedUrl(url);
        setShowQRModal(true);
        };

        const handleCloseQRModal = () => {
        setShowQRModal(false);
        setSelectedUrl("");
        };

    // Función para obtener todos los libros y categorías de Firestore
    const fetchData = async () => {
        try {
            const librosData = await getDocs(librosCollection);
            const fetchedLibros = librosData.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            }));
            setLibros(fetchedLibros);
            setLibrosFiltrados(fetchedLibros) //Inicializa los Libros filtrados

             // Obtener categorías
        const categoriasData = await getDocs(categoriasCollection);
        const fetchedCategorias = categoriasData.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));
        setCategorias(fetchedCategorias);

        } catch (error) {
            console.error("Error al obtener datos:", error);
            setError("Error al cargar los datos. Intenta de nuevo.");
        }
        };

    // Hook useEffect para carga inicial de datos
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        } else {
        fetchData();
        }
    }, [isLoggedIn, navigate]);

    // Calcular libros paginados
    const paginatedLibros = librosFiltrados.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    //Hook useEffect para filtrar libros según el texto de búsqueda
    const handleSearchChange = (e) => {
        const text = e.target.value.toLowerCase();
        setSearchText(text);
        
        const filtrados = libros.filter((libro) => 
            libro.titulo.toLowerCase().includes(text) || 
            libro.descripcion.toLowerCase().includes(text) ||
            libro.categoria.toLowerCase().includes(text) ||
            libro.edicion.toLowerCase().includes(text) ||
            libro.dirigido.toLowerCase().includes(text) ||
            libro.area_edu.toLowerCase().includes(text) 
        );
    
        setLibrosFiltrados(filtrados);
    };

    // Método para copiar datos al portapapeles
    const handleCopy = (libro) => {
    const rowData = `Título: ${libro.titulo}\nÁrea educativa: ${libro.area_edu}\nDirigido a: ${libro.dirigido}\nEdición: ${libro.edicion}\nCategoría: ${libro.categoria}\nDescripción: ${libro.descripcion}`;
    navigator.clipboard
        .writeText(rowData)
        .then(() => {
        console.log("Datos de la fila copiados al portapapeles:\n" + rowData);
        })
        .catch((err) => {
        console.error("Error al copiar al portapapeles:", err);
        });
    };

    // Manejador de cambios en inputs del formulario de nuevo libro
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoLibro((prev) => ({ ...prev, [name]: value }));
    };

    // Manejador de cambios en inputs del formulario de edición
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setLibroEditado((prev) => ({ ...prev, [name]: value }));
    };

    // Manejador para la carga de imágenes
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNuevoLibro((prev) => ({ ...prev, imagen: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            alert("Por favor, selecciona una imagen válida.");
        }
    };

    //Manejador para la carga de archivos .pdf
        const handlePdfChange = (e) => {
            const file = e.target.files[0];
            if (file && file.type === "application/pdf") {
            setPdfFile(file);
            } else {
            alert("Por favor, selecciona un archivo PDF.");
            }
        };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLibroEditado((prev) => ({ ...prev, imagen: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            alert("Por favor, selecciona una imagen válida.");
        }
    };

        const handleEditPdfChange = (e) => {
            const file = e.target.files[0];
            if (file && file.type === "application/pdf") {
            setPdfFile(file);
            } else {
            alert("Por favor, selecciona un archivo PDF.");
            }
        };

    // Función para agregar un nuevo libro (CREATE)
        const handleAddLibro = async () => {
            if (!isLoggedIn) {
            alert(t('libros.debeIniciarSesion'));
            navigate("/login");
            return;
            }
        
            try {
            const storageRef = ref(storage, `libros/${pdfFile.name}`);
            await uploadBytes(storageRef, pdfFile);
            const pdfUrl = await getDownloadURL(storageRef);
        
            await addDoc(librosCollection, { ...nuevoLibro, pdfUrl });
            setShowModal(false);
            setNuevoLibro({ titulo: "", descripcion: "", area_edu: "", edicion: "", dirigido: "", imagen:"", categoria: "", pdfUrl: "" });
            setPdfFile(null);
            } catch (error) {
            console.error("Error al agregar libro:", error);
            setError(t('libros.errorAgregar'));
            }
        };

    // Función para actualizar un libro existente (UPDATE)
    const handleEditLibro = async () => {
        if (!isLoggedIn) {
            alert("Debes iniciar sesión para editar un libro.");
            navigate("/login");
            return;
            }
        
            if (!libroEditado.titulo || !libroEditado.area_edu || 
                !libroEditado.descripcion || !libroEditado.edicion || !libroEditado.dirigido || !libroEditado.categoria ) {
            alert("Por favor, completa todos los campos requeridos.");
            return;
            }
            try {
            const libroRef = doc(db, "libros", libroEditado.id);
            if (pdfFile) {
                if (libroEditado.pdfUrl) {
                const oldPdfRef = ref(storage, libroEditado.pdfUrl);
                await deleteObject(oldPdfRef).catch((error) => {
                    console.error("Error al eliminar el PDF anterior:", error);
                });
                }
                const storageRef = ref(storage, `libros/${pdfFile.name}`);
                await uploadBytes(storageRef, pdfFile);
                const newPdfUrl = await getDownloadURL(storageRef);
                await updateDoc(libroRef, { ...libroEditado, pdfUrl: newPdfUrl });
            } else {
                await updateDoc(libroRef, libroEditado);
            }
            setShowEditModal(false);
            setPdfFile(null);
            await fetchData();
            } catch (error) {
            console.error("Error al actualizar libro:", error);
            setError("Error al actualizar el libro. Intenta de nuevo.");
            }
        };
    
    // Función para eliminar un libro (DELETE)
    const handleDeleteLibro = async () => {
        if (!isLoggedIn) {
            alert("Debes iniciar sesión para eliminar un libro.");
            navigate("/login");
            return;
            }
        
            if (libroAEliminar) {
            try {
                const libroRef = doc(db, "libros", libroAEliminar.id);
                if (libroAEliminar.pdfUrl) {
                const pdfRef = ref(storage, libroAEliminar.pdfUrl);
                await deleteObject(pdfRef).catch((error) => {
                    console.error("Error al eliminar el PDF de Storage:", error);
                });
                }
                await deleteDoc(libroRef);
                setShowDeleteModal(false);
                await fetchData();
            } catch (error) {
                console.error("Error al eliminar libro:", error);
                setError("Error al eliminar el libro. Intenta de nuevo.");
            }
            }
        };

    // Función para abrir el modal de edición con datos prellenados
    const openEditModal = (libro) => {
        setLibroEditado({ ...libro });
        setShowEditModal(true);
    };

    // Función para abrir el modal de eliminación
    const openDeleteModal = (libro) => {
        setLibroAEliminar(libro);
        setShowDeleteModal(true);
    };

    const generarPDFLibros = () => {
        if (!librosFiltrados || librosFiltrados.length === 0) {
            alert("No hay libros para exportar.");
            return;
        }

        const doc = new jsPDF("p", "mm", "a4");

        // ENCABEZADO
        doc.setFillColor(28, 41, 51);
        doc.rect(0, 0, 210, 25, "F"); // 210mm = ancho A4

        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text("Lista de Libros", 105, 16, { align: "center" });

        const columnas = [
            { header: "#", dataKey: "num" },
            { header: "Título", dataKey: "titulo" },
            { header: "Área educativa", dataKey: "area" },
            { header: "Dirigido a", dataKey: "dirigido" },
            { header: "Edición", dataKey: "edicion" },
            { header: "Categoría", dataKey: "categoria" },
            { header: "Descripción", dataKey: "descripcion" }
        ];

        const filas = librosFiltrados.map((libro, index) => ({
            num: index + 1,
            titulo: libro.titulo,
            area: libro.area_edu,
            dirigido: libro.dirigido,
            edicion: libro.edicion,
            categoria: libro.categoria,
            descripcion: libro.descripcion
        }));

        const totalPaginas = "{total_pages_count_string}";

        autoTable(doc, {
            columns: columnas,
            body: filas,
            startY: 30,
            theme: "striped",
            headStyles: {
                fillColor: [0, 173, 181],
                textColor: 255,
                halign: "center",
                valign: "middle"
            },
            styles: {
                fontSize: 9,
                cellPadding: 2,
                valign: "top",
                overflow: "linebreak"
            },
            columnStyles: {
                num: { cellWidth: 10, halign: "center" },
                titulo: { cellWidth: 35 },
                area: { cellWidth: 25 },
                dirigido: { cellWidth: 20 },
                edicion: { cellWidth: 30 },
                categoria: { cellWidth: 25 },
                descripcion: { cellWidth: 55 }
            },
            margin: { top: 30, left: 5, right: 14 },
            didDrawPage: function (data) {
                const pageHeight = doc.internal.pageSize.getHeight();
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageNumber = doc.internal.getNumberOfPages();

                doc.setFontSize(9);
                doc.setTextColor(0);
                doc.text(`Página ${pageNumber} de ${totalPaginas}`, pageWidth / 2, pageHeight - 10, { align: "center" });
            }
        });

        if (typeof doc.putTotalPages === "function") {
            doc.putTotalPages(totalPaginas);
        }

        const fecha = new Date();
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const nombreArchivo = `libros_${dia}${mes}${anio}.pdf`;

        doc.save(nombreArchivo);
    };

    const generarPDFDetalleLibro = (libro) => {
    const pdf = new jsPDF();
    const anchoPagina = pdf.internal.pageSize.getWidth();

    // ENCABEZADO
    pdf.setFillColor(28, 41, 51);
    pdf.rect(0, 0, anchoPagina, 30, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);

    // Título centrado (recortado si es muy largo)
    const titulo = libro.titulo.length > 70 ? libro.titulo.slice(0, 67) + "..." : libro.titulo;
    pdf.text(titulo, anchoPagina / 2, 18, { align: "center" });

    let cursorY = 40;

    // IMAGEN (si existe)
    if (libro.imagen) {
        try {
            const propiedadesImagen = pdf.getImageProperties(libro.imagen);
            const anchoImagen = 70;
            const altoImagen = (propiedadesImagen.height * anchoImagen) / propiedadesImagen.width;
            const posicionX = (anchoPagina - anchoImagen) / 2;
            pdf.addImage(libro.imagen, 'JPEG', posicionX, cursorY, anchoImagen, altoImagen);
            cursorY += altoImagen + 12;
        } catch (error) {
            console.warn("Error al cargar la imagen del libro:", error);
        }
    }

    // DATOS DEL LIBRO
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    const margenX = 20;
    const anchoTexto = anchoPagina - margenX * 2;

    const datos = [
        `Área educativa: ${libro.area_edu}`,
        `Dirigido a: ${libro.dirigido}`,
        `Edición: ${libro.edicion}`,
        `Categoría: ${libro.categoria}`,
        `Descripción:`,
    ];

    datos.forEach((linea, i) => {
        pdf.text(linea, margenX, cursorY);
        cursorY += 8;
    });

    // DESCRIPCIÓN (multi-línea si es muy larga)
    const descripcionFormateada = pdf.splitTextToSize(libro.descripcion, anchoTexto);
    pdf.text(descripcionFormateada, margenX, cursorY);

    // GUARDAR PDF
    const tituloLimpio = libro.titulo.replace(/[\\/:*?"<>|]/g, ""); // evitar caracteres no válidos en nombre de archivo
    pdf.save(`${tituloLimpio}.pdf`);
    };

    const exportarExcelLibros = () => {
    // Preparar los datos para la hoja de Excel
    const datos = librosFiltrados.map((libro, index) => ({
        "#": index + 1,
        "Título": libro.titulo,
        "Área educativa": libro.area_edu,
        "Dirigido a": libro.dirigido,
        "Edición": libro.edicion,
        "Categoría": libro.categoria,
        "Descripción": libro.descripcion,
    }));

    // Crear la hoja de cálculo desde los datos
    const hoja = XLSX.utils.json_to_sheet(datos, {
        origin: 'A2'  // Deja espacio para un título
    });

    // Agregar un título personalizado
    XLSX.utils.sheet_add_aoa(hoja, [["Listado de libros disponibles"]], { origin: "A1" });

    // Aplicar estilo al título (requiere SheetJS Pro o aplicar estilo luego con otra herramienta)
    hoja['A1'].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: "center" }
    };

    // Crear el libro Excel y agregar la hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Libros');

    // Ajustar el ancho de columnas automáticamente
    const anchoColumnas = datos.length > 0 
        ? Object.keys(datos[0]).map(key => ({ wch: Math.max(key.length + 2, 20) }))
        : [];
    hoja['!cols'] = anchoColumnas;

    // Generar buffer y guardar el archivo
    const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });

    // Fecha para el nombre del archivo
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const nombreArchivo = `Libros_${dia}${mes}${anio}.xlsx`;

    // Descargar archivo
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, nombreArchivo);
};


    // Renderizado del componente
    return (
        <Container className="mt-4">
            <br />
            <h4 className="title-gestion">{t('libros.gestionLibros')}</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="align-items-center mb-4">
        {/* Cuadro de búsqueda */}
        <Col xs={12} sm={3} md={6} className="mt-2">
            <div className="d-flex">
                <CuadroBusquedas
                    searchText={searchText}
                    handleSearchChange={handleSearchChange}
                    className="w-100"
                />
            </div>
        </Col>
    </Row>

    {/* Botones de exportación */}
    <Row className="mb-3">
        {/* Botón Agregar libro */}
        <Col xs={12} sm={6} md={3} className="mb-2">
            <Button className="btn-block btn-agregar  w-100" 
            onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-lg"></i> {t('libros.agregarLibro')}
            </Button>
        </Col>
        <Col xs={12} sm={6} md={3} className="mb-2">
            <Button
                className="btn-block btn-agregar w-100"
                onClick={exportarExcelLibros}
                variant="primary"
            >
                <i className="bi bi-file-earmark-excel me-2"></i>
                {t('libros.generarExcel')}
            </Button>
        </Col>
        <Col xs={12} sm={6} md={3} className="mb-2">
            <Button
                className="btn-block btn-agregar w-100"
                onClick={generarPDFLibros}
                variant="primary"
            >
                <i className="bi bi-file-earmark-pdf me-2"></i>
                {t('libros.descargarReportePDF')}
            </Button>
        </Col>
    </Row>


            <TablaLibros            
                openEditModal={openEditModal}
                openDeleteModal={openDeleteModal}
                libros={paginatedLibros} // Pasar productos paginados
                totalItems={librosFiltrados.length} // Total de productos
                itemsPerPage={itemsPerPage}   // Elementos por página
                currentPage={currentPage}     // Página actual
                setCurrentPage={setCurrentPage} // Método para cambiar página
                handleCopy={handleCopy}
                openQRModal={openQRModal}
                generarPDFDetalleLibro={generarPDFDetalleLibro}
            />
            <Paginacion
                itemsPerPage={itemsPerPage}
                totalItems={librosFiltrados.length}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            <ModalRegistroLibro
                showModal={showModal}
                setShowModal={setShowModal}
                nuevoLibro={nuevoLibro}
                handleInputChange={handleInputChange}
                handleImageChange={handleImageChange}
                handlePdfChange={handlePdfChange}
                handleAddLibro={handleAddLibro}
                categorias={categorias}
            />
            <ModalEdicionLibro
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                libroEditado={libroEditado}
                handleEditInputChange={handleEditInputChange}
                handleEditImageChange={handleEditImageChange}
                handleEditPdfChange={handleEditPdfChange}
                handleEditLibro={handleEditLibro}
                categorias={categorias}
            />
            <ModalEliminacionLibro
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                handleDeleteLibro={handleDeleteLibro}
            />
            <ModalQR
            show={showQRModal}
            handleClose={handleCloseQRModal}
            qrURL={selectedUrl}
            />
        </Container>
    );
};

export default Libros;

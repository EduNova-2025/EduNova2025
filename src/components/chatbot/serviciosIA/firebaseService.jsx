  import { getDocs, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
  import { db } from '../../../database/firebaseconfig';
  import * as pdfjsLib from 'pdfjs-dist';

  // Usa una variable de entorno para la API Key de Gemini
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

  // Estado global simulado
  let mensajes = [];
  let cargando = false;

  // Estado para almacenar el PDF cargado por el usuario
  let uploadedPdfText = '';

  // Efecto para cargar mensajes
  const loadMessages = () => {
    const chatCollection = collection(db, 'chatHistory');
    const q = query(chatCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      mensajes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Mensajes cargados:', mensajes); // Para depuración
    });

    return unsubscribe;
  };

  // Función para procesar un PDF cargado
  export const processUploadedPdf = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let pdfText = '';

      const maxPages = Math.min(pdfDocument.numPages, 5); // Limitar a 5 páginas
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        pdfText += pageText + '\n';
      }

      uploadedPdfText = pdfText; // Almacenar el texto extraído
      console.log('Texto extraído del PDF cargado:', uploadedPdfText);
      return true;
    } catch (error) {
      console.error('Error al procesar el PDF cargado:', error);
      uploadedPdfText = 'Error al procesar el PDF cargado.';
      return false;
    }
  };

  // Función para resetear el chat
  export const resetChat = async () => {
    try {
      mensajes = [];
      uploadedPdfText = ''; // Limpiar el PDF cargado
      console.log('Chat reseteado. Mensajes y PDF cargado eliminados.');
    } catch (error) {
      console.error('Error al resetear el chat:', error);
    }
  };

  // Función enviarMensaje
  const enviarMensaje = async (question) => {
    if (!question || !question.trim()) {
      console.log('No se puede enviar un mensaje vacío.');
      return;
    }

    const nuevoMensaje = {
      question,
      emisor: "usuario",
      timestamp: new Date(),
    };

    cargando = true;

    try {
      const chatCollection = collection(db, 'chatHistory');
      await addDoc(chatCollection, nuevoMensaje);
      const respuestaIA = await obtenerRespuestaIA(question);
      await addDoc(chatCollection, {
        answer: respuestaIA,
        emisor: "ia",
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      const chatCollection = collection(db, 'chatHistory');
      await addDoc(chatCollection, {
        answer: "Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.",
        emisor: "ia",
        timestamp: new Date(),
      });
    } finally {
      cargando = false;
    }
  };

  // Función obtenerRespuestaIA con razonamiento basado en PDF cargado
  const obtenerRespuestaIA = async (promptUsuario) => {
    try {
      // Verificación inicial de la conexión con la API
      const healthCheck = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: "Test connection" }],
              },
            ],
          }),
        }
      );

      if (!healthCheck.ok) {
        throw new Error(`Error de conexión con la IA: ${healthCheck.statusText}`);
      }

      const docsSnap = await getDocs(collection(db, 'libros'));
      let context = uploadedPdfText || ''; // Priorizar PDF cargado

      // Si no hay PDF cargado, usar PDFs de Firestore
      if (!uploadedPdfText) {
        const pdfUrls = [];
        docsSnap.forEach(doc => {
          const data = doc.data();
          if (data.pdfUrl) {
            pdfUrls.push(data.pdfUrl);
          }
        });

        if (pdfUrls.length === 0) {
          context += 'No se encontraron libros en la base de datos.';
        } else {
          const maxPdfs = 3;
          for (let i = 0; i < Math.min(pdfUrls.length, maxPdfs); i++) {
            const pdfUrl = pdfUrls[i];
            try {
              const response = await fetch(pdfUrl);
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              const pdfData = await response.arrayBuffer();
              const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;
              let pdfText = '';

              const maxPages = Math.min(pdfDocument.numPages, 5);
              for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                const page = await pdfDocument.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                pdfText += pageText + '\n';
              }

              context += `Contenido del PDF (${pdfUrl}):\n${pdfText}\n`;
            } catch (pdfError) {
              context += `Error al procesar el PDF en ${pdfUrl}: ${pdfError.message}\n`;
            }
          }
        }
      }

      // Detectar si es un saludo
      const lowerPrompt = promptUsuario.toLowerCase();
      const esSaludo = lowerPrompt.includes("hola") || lowerPrompt.includes("buenos días") || 
                      lowerPrompt.includes("buenas tardes") || lowerPrompt.includes("buenas noches");
      
      // Detectar si se pide un plan de clases
      const pidePlan = lowerPrompt.includes("plan de clases") || lowerPrompt.includes("plan de lección") || 
                      lowerPrompt.includes("genera un plan") || lowerPrompt.includes("crea un plan");

      // Construir el prompt dinámico
      let prompt = `Contexto educativo: ${context}\n`;

      if (esSaludo) {
        prompt += `El usuario te ha saludado con: "${promptUsuario}". Responde con un saludo cordial antes de continuar. `;
      }

      if (pidePlan) {
        prompt += `El usuario ha solicitado un plan de clases: "${promptUsuario}". Basándote en el contenido del PDF cargado (o del libro de 5to grado de primaria si no hay PDF cargado), genera un plan de clases estructurado que incluya: 
        1. Título de la lección
        2. Objetivos de aprendizaje
        3. Materiales necesarios
        4. Actividades (con pasos detallados)
        5. Evaluación
        Asegúrate de que el plan sea adecuado para estudiantes de quinto grado de primaria. Razonamiento: Analiza el contenido del PDF para identificar temas relevantes y crea un plan basado en ellos.`;
      } else {
        prompt += `Pregunta: ${promptUsuario}\nResponde como un asistente pedagógico para docentes de quinto grado de primaria, utilizando el contenido del PDF cargado (o el libro de 5to grado si no hay PDF cargado) para razonar.`;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                ],
              },
            ],
          }),
        }
      );

      if (response.status === 429) {
        return "Has alcanzado el límite de solicitudes. Intenta de nuevo más tarde.";
      }

      const data = await response.json();
      const respuestaIA = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!respuestaIA) {
        return "No hubo respuesta de la IA.";
      }

      return respuestaIA;
    } catch (error) {
      console.error("Error al obtener respuesta de la IA:", error);
      return `No se pudo conectar con la IA. Verifica tu conexión o API Key. Detalle: ${error.message}`;
    }
  };

  // Función principal para obtener respuesta
  export const getAnswerFromFirebase = async (question) => {
    if (!question || !question.trim()) {
      return "No se puede enviar un mensaje vacío.";
    }

    if (!mensajes.length) {
      const unsubscribe = loadMessages();
    }

    await enviarMensaje(question);

    const ultimaRespuesta = mensajes.length > 0 ? mensajes[mensajes.length - 1].answer : "No hay respuestas disponibles.";
    return ultimaRespuesta;
  };

  // Función para guardar historial
  export const saveChatHistory = async (question, answer) => {
    try {
      await addDoc(collection(db, 'chatHistory'), {
        question,
        answer,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error guardando el historial de chat:', error);
    }
  };
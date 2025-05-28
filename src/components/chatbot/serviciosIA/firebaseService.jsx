import { getDocs, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../database/firebaseconfig';
import * as pdfjsLib from 'pdfjs-dist';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

let mensajes = [];
let cargando = false;
let uploadedPdfText = '';
let currentSessionId = null;
let forceNewSession = false;

const auth = getAuth();

// Función para crear o cargar una sesión activa
const getOrCreateSession = async (userId, firstPrompt = '') => {
  if (!userId) {
    console.error('No userId provided for session creation.');
    return null;
  }

  const sessionsCollection = collection(db, 'chatSessions');
  const q = query(sessionsCollection, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  const userSessions = snapshot.docs.filter(doc => doc.data().userId === userId);

  if (!forceNewSession && userSessions.length > 0) {
    currentSessionId = userSessions[0].id;
    console.log('Using existing session:', currentSessionId);
    return currentSessionId;
  } else {
    const title = firstPrompt ? firstPrompt.substring(0, 50) : 'Nueva sesión';
    try {
      const newSession = await addDoc(sessionsCollection, {
        userId,
        title,
        timestamp: serverTimestamp(),
      });
      currentSessionId = newSession.id;
      forceNewSession = false;
      console.log('New session created:', currentSessionId);
      return currentSessionId;
    } catch (error) {
      console.error('Error creating new session:', error);
      return null;
    }
  }
};

// Efecto para cargar mensajes de la sesión activa
const loadMessages = (sessionId, callback) => {
  if (!sessionId) {
    console.log('No sessionId provided, returning empty messages.');
    callback([]);
    return () => {};
  }

  const messagesCollection = collection(db, `chatSessions/${sessionId}/messages`);
  const q = query(messagesCollection, orderBy('timestamp', 'asc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    mensajes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('Messages loaded for session', sessionId, ':', mensajes);
    callback(mensajes);
  }, (error) => {
    console.error('Error loading messages:', error);
    callback([]);
  });

  return unsubscribe;
};

// Función para procesar un PDF cargado
export const processUploadedPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let pdfText = '';

    const maxPages = Math.min(pdfDocument.numPages, 5);
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      pdfText += pageText + '\n';
    }

    uploadedPdfText = pdfText;
    console.log('PDF text extracted:', uploadedPdfText);
    return true;
  } catch (error) {
    console.error('Error processing uploaded PDF:', error);
    uploadedPdfText = 'Error al procesar el PDF cargado.';
    return false;
  }
};

// Función para resetear el chat
export const resetChat = async () => {
  try {
    mensajes = [];
    uploadedPdfText = '';
    currentSessionId = null;
    forceNewSession = true;
    console.log('Chat reset. Prepared for new session.');
  } catch (error) {
    console.error('Error resetting chat:', error);
  }
};

// Función para cerrar sesión
export const clearSession = async () => {
  try {
    mensajes = [];
    uploadedPdfText = '';
    currentSessionId = null;
    forceNewSession = false;
    console.log('Session cleared.');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

// Función enviarMensaje
const enviarMensaje = async (question, userId) => {
  if (!question || !question.trim()) {
    console.log('Cannot send empty message.');
    return false;
  }

  if (!userId) {
    console.error('No userId provided for sending message.');
    return false;
  }

  if (!currentSessionId || forceNewSession) {
    currentSessionId = await getOrCreateSession(userId, question);
    if (!currentSessionId) {
      console.error('Failed to create or get session.');
      return false;
    }
  }

  const nuevoMensaje = {
    question,
    emisor: 'usuario',
    timestamp: serverTimestamp(),
  };

  cargando = true;

  try {
    const messagesCollection = collection(db, `chatSessions/${currentSessionId}/messages`);
    console.log('Saving user message:', nuevoMensaje);
    await addDoc(messagesCollection, nuevoMensaje);

    const respuestaIA = await obtenerRespuestaIA(question);
    console.log('IA response received:', respuestaIA);

    await addDoc(messagesCollection, {
      answer: respuestaIA,
      emisor: 'ia',
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    const messagesCollection = collection(db, `chatSessions/${currentSessionId}/messages`);
    await addDoc(messagesCollection, {
      answer: 'Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.',
      emisor: 'ia',
      timestamp: serverTimestamp(),
    });
    return false;
  } finally {
    cargando = false;
  }
};

// Función obtenerRespuestaIA
const obtenerRespuestaIA = async (promptUsuario) => {
  try {
    // Verificar la API Key
    if (!apiKey) {
      throw new Error('API Key is missing. Please check VITE_GOOGLE_AI_API_KEY in .env file.');
    }

    console.log('Building context for Gemini API...');
    let context = uploadedPdfText || '';

    if (!uploadedPdfText) {
      console.log('No uploaded PDF, checking libros collection...');
      const docsSnap = await getDocs(collection(db, 'libros'));
      const pdfUrls = [];
      docsSnap.forEach(doc => {
        const data = doc.data();
        if (data.pdfUrl) pdfUrls.push(data.pdfUrl);
      });

      if (pdfUrls.length === 0) {
        context += 'No se encontraron libros en la base de datos.';
        console.log('No PDFs found in libros collection.');
      } else {
        const maxPdfs = 3;
        for (let i = 0; i < Math.min(pdfUrls.length, maxPdfs); i++) {
          const pdfUrl = pdfUrls[i];
          try {
            console.log(`Fetching PDF from ${pdfUrl}...`);
            const response = await fetch(pdfUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status} for ${pdfUrl}`);
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
            console.log(`PDF text extracted from ${pdfUrl}`);
          } catch (pdfError) {
            console.error(`Error processing PDF at ${pdfUrl}:`, pdfError);
            context += `Error al procesar el PDF en ${pdfUrl}: ${pdfError.message}\n`;
          }
        }
      }
    }

    const lowerPrompt = promptUsuario.toLowerCase();
    const esSaludo =
      lowerPrompt.includes('hola') ||
      lowerPrompt.includes('buenos días') ||
      lowerPrompt.includes('buenas tardes') ||
      lowerPrompt.includes('buenas noches');
    const pidePlan =
      lowerPrompt.includes('plan de clases') ||
      lowerPrompt.includes('plan de lección') ||
      lowerPrompt.includes('genera un plan') ||
      lowerPrompt.includes('crea un plan');

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

    console.log('Sending prompt to Gemini API:', prompt);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
      throw new Error('Invalid response structure from Gemini API: ' + JSON.stringify(data));
    }

    const respuestaIA = data.candidates[0].content.parts[0].text;
    console.log('IA response received:', respuestaIA);
    return respuestaIA;
  } catch (error) {
    console.error('Error obtaining IA response:', error);
    return `No se pudo conectar con la IA. Detalle: ${error.message}`;
  }
};

// Función principal para obtener respuesta
export const getAnswerFromFirebase = async (question) => {
  if (!question || !question.trim()) {
    console.log('Cannot send empty question.');
    return 'No se puede enviar un mensaje vacío.';
  }

  const user = auth.currentUser;
  if (!user) {
    console.log('No authenticated user found.');
    return 'Debes iniciar sesión para enviar mensajes.';
  }

  const success = await enviarMensaje(question, user.uid);
  if (!success) {
    console.log('Message sending failed.');
    return 'No se pudo enviar el mensaje.';
  }

  const ultimaRespuesta = mensajes.length > 0 ? mensajes[mensajes.length - 1].answer : 'No hay respuestas disponibles.';
  console.log('Returning last response:', ultimaRespuesta);
  return ultimaRespuesta;
};

// Función para cargar mensajes de la sesión activa
export const loadSessionMessages = (callback) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No user authenticated, returning empty messages.');
    callback([]);
    return () => {};
  }

  getOrCreateSession(user.uid).then((sessionId) => {
    if (sessionId) {
      return loadMessages(sessionId, callback);
    } else {
      console.log('No session found or created, returning empty messages.');
      callback([]);
      return () => {};
    }
  });
};

// Función para guardar historial (opcional, para compatibilidad)
export const saveChatHistory = async (question, answer) => {
  if (!currentSessionId) {
    console.log('No current session ID, cannot save history.');
    return;
  }

  try {
    await addDoc(collection(db, `chatSessions/${currentSessionId}/messages`), {
      question,
      answer,
      timestamp: serverTimestamp(),
    });
    console.log('Chat history saved:', { question, answer });
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};
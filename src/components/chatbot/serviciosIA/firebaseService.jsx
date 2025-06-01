import { getDocs, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../database/firebaseconfig';
import * as pdfjsLib from 'pdfjs-dist';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

let uploadedPdfText = '';
let currentSessionId = null;
let forceNewSession = false;

const auth = getAuth();

export const getOrCreateSession = async (userId, firstPrompt = '') => {
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

export const loadMessages = (sessionId, callback) => {
  if (!sessionId) {
    console.log('No sessionId provided, returning empty messages.');
    callback([]);
    return () => {};
  }

  const messagesCollection = collection(db, `chatSessions/${sessionId}/messages`);
  const q = query(messagesCollection, orderBy('timestamp', 'asc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('Messages loaded for session', sessionId, ':', messages);
    callback(messages);
  }, (error) => {
    console.error('Error loading messages:', error);
    callback([]);
  });

  return unsubscribe;
};

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

export const resetChat = async () => {
  try {
    uploadedPdfText = '';
    currentSessionId = null;
    forceNewSession = true;
    console.log('Chat reset. Prepared for new session.');
  } catch (error) {
    console.error('Error resetting chat:', error);
  }
};

export const clearSession = async () => {
  try {
    uploadedPdfText = '';
    currentSessionId = null;
    forceNewSession = false;
    console.log('Session cleared.');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

const enviarMensaje = async (question, userId, sessionId) => {
  if (!question || !question.trim()) {
    console.log('Cannot send empty message.');
    return { success: false, response: 'No se puede enviar un mensaje vacío.' };
  }

  if (!userId) {
    console.error('No userId provided for sending message.');
    return { success: false, response: 'No userId provided.' };
  }

  let targetSessionId = sessionId || currentSessionId;
  if (!targetSessionId || forceNewSession) {
    targetSessionId = await getOrCreateSession(userId, question);
    if (!targetSessionId) {
      console.error('Failed to create or get session.');
      return { success: false, response: 'Failed to create or get session.' };
    }
  }

  try {
    const messagesCollection = collection(db, `chatSessions/${targetSessionId}/messages`);
    const respuestaIA = await obtenerRespuestaIA(question);
    console.log('IA response received:', respuestaIA);

    await addDoc(messagesCollection, {
      question,
      answer: respuestaIA,
      emisor: 'both',
      timestamp: serverTimestamp(),
    });

    currentSessionId = targetSessionId;
    return { success: true, response: respuestaIA };
  } catch (error) {
    console.error('Error sending message:', error);
    const messagesCollection = collection(db, `chatSessions/${targetSessionId}/messages`);
    await addDoc(messagesCollection, {
      question,
      answer: 'Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.',
      emisor: 'both',
      timestamp: serverTimestamp(),
    });
    return { success: false, response: 'Error processing request.' };
  }
};

const obtenerRespuestaIA = async (promptUsuario) => {
  try {
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

export const getAnswerFromFirebase = async (question, sessionId) => {
  if (!question || !question.trim()) {
    console.log('Cannot send empty question.');
    return 'No se puede enviar un mensaje vacío.';
  }

  const user = auth.currentUser;
  if (!user) {
    console.log('No authenticated user found.');
    return 'Debes iniciar sesión para enviar mensajes.';
  }

  const { success, response } = await enviarMensaje(question, user.uid, sessionId);
  if (!success) {
    console.log('Message sending failed.');
    return response;
  }

  return response;
};

export const loadSessionMessages = (callback) => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No user authenticated, returning empty messages.');
    callback([]);
    return () => {};
  }

  return getOrCreateSession(user.uid).then((sessionId) => {
    if (sessionId) {
      return loadMessages(sessionId, callback);
    } else {
      console.log('No session found or created, returning empty messages.');
      callback([]);
      return () => {};
    }
  });
};

export const saveChatHistory = async (question, answer) => {
  if (!currentSessionId) {
    console.log('No current session ID, cannot save history.');
    return;
  }

  try {
    await addDoc(collection(db, `chatSessions/${currentSessionId}/messages`), {
      question,
      answer,
      emisor: 'both',
      timestamp: serverTimestamp(),
    });
    console.log('Chat history saved:', { question, answer });
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

export const deleteSession = async (sessionId, userId) => {
  try {
    const sessionDoc = doc(db, `chatSessions/${sessionId}`);
    const sessionSnapshot = await getDoc(sessionDoc);
    if (sessionSnapshot.exists() && sessionSnapshot.data().userId === userId) {
      await deleteDoc(sessionDoc);
      console.log(`Session ${sessionId} deleted successfully`);
      if (currentSessionId === sessionId) {
        currentSessionId = null;
      }
      return true;
    } else {
      console.error('Session does not exist or user does not have permission');
      return false;
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
};

export const updateSessionTitle = async (sessionId, newTitle, userId) => {
  try {
    const sessionDoc = doc(db, `chatSessions/${sessionId}`);
    const sessionSnapshot = await getDoc(sessionDoc);
    if (sessionSnapshot.exists() && sessionSnapshot.data().userId === userId) {
      await setDoc(sessionDoc, { title: newTitle, timestamp: serverTimestamp() }, { merge: true });
      console.log(`Session ${sessionId} title updated to ${newTitle}`);
      if (currentSessionId === sessionId) {
        currentSessionId = sessionId;
      }
      return true;
    } else {
      console.error('Session does not exist or user does not have permission');
      return false;
    }
  } catch (error) {
    console.error('Error updating session title:', error);
    return false;
  }
};
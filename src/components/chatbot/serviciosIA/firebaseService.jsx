import { getDocs, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../database/firebaseconfig';
import * as pdfjsLib from 'pdfjs-dist';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

let uploadedPdfText = '';
let currentSessionId = null;
let forceNewSession = false;
let isPdfUploaded = false; // Track if a valid PDF was uploaded

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

    // Limit to 20 pages to avoid token overflow, prioritize structure
    const maxPages = Math.min(pdfDocument.numPages, 20);
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      // Preserve structure by grouping text items (e.g., headings, paragraphs)
      const pageText = textContent.items
        .map(item => {
          // Add newline for larger font sizes (likely headings)
          const fontSize = item.transform ? item.transform[0] : 0;
          return fontSize > 12 ? `\n${item.str.trim()}\n` : item.str.trim();
        })
        .filter(str => str.length > 0)
        .join(' ');
      pdfText += `Página ${pageNum}:\n${pageText}\n\n`;
    }

    if (!pdfText.trim() || pdfText.length < 100) {
      throw new Error('El PDF no contiene texto suficiente o relevante.');
    }

    uploadedPdfText = pdfText;
    isPdfUploaded = true;
    console.log('PDF text extracted successfully:', uploadedPdfText.substring(0, 500) + '...', `Total length: ${pdfText.length} characters`);
    return true;
  } catch (error) {
    console.error('Error processing uploaded PDF:', error);
    uploadedPdfText = `Error al procesar el PDF cargado: ${error.message}`;
    isPdfUploaded = false;
    return false;
  }
};

export const resetChat = async () => {
  try {
    uploadedPdfText = '';
    isPdfUploaded = false;
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
    isPdfUploaded = false;
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
    console.log('IA response received:', respuestaIA.substring(0, 500) + '...');

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
    let context = '';

    // Prioritize uploaded PDF if available and valid
    if (isPdfUploaded && uploadedPdfText && !uploadedPdfText.startsWith('Error al procesar el PDF')) {
      // Limit context to ~10,000 characters to avoid token overflow
      const maxContextLength = 10000;
      context = `Contenido del PDF cargado (libro de texto):\n${uploadedPdfText.substring(0, maxContextLength)}\n`;
      if (uploadedPdfText.length > maxContextLength) {
        context += `\n[Nota: El contenido del PDF fue truncado a ${maxContextLength} caracteres para optimizar el procesamiento.]\n`;
      }
      console.log('Using uploaded PDF text for context, length:', context.length);
    } else {
      console.log('No valid uploaded PDF, checking libros collection...');
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
        const maxPdfs = 2;
        for (let i = 0; i < Math.min(pdfUrls.length, maxPdfs); i++) {
          const pdfUrl = pdfUrls[i];
          try {
            console.log(`Fetching PDF from ${pdfUrl}...`);
            const response = await fetch(pdfUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status} for ${pdfUrl}`);
            const pdfData = await response.arrayBuffer();
            const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;
            let pdfText = '';

            const maxPages = Math.min(pdfDocument.numPages, 10);
            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
              const page = await pdfDocument.getPage(pageNum);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map(item => item.str.trim())
                .filter(str => str.length > 0)
                .join(' ');
              pdfText += `Página ${pageNum}:\n${pageText}\n\n`;
            }

            context += `Contenido del libro (${pdfUrl}):\n${pdfText}\n`;
            console.log(`PDF text extracted from ${pdfUrl}, length: ${pdfText.length}`);
          } catch (pdfError) {
            console.error(`Error processing PDF at ${pdfUrl}:`, pdfError);
            context += `Error al procesar el libro en ${pdfUrl}: ${pdfError.message}\n`;
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

    let prompt = '';

    if (isPdfUploaded) {
      prompt += `Un PDF ha sido cargado y su contenido debe ser la fuente principal para responder. Usa exclusivamente el contenido del PDF proporcionado en el contexto para generar la respuesta, a menos que se indique lo contrario. Contexto educativo: ${context}\n`;
    } else {
      prompt += `No se ha cargado un PDF válido. Usa el contenido de la colección 'libros' o conocimientos generales si no hay libros disponibles. Contexto educativo: ${context}\n`;
    }

    if (esSaludo) {
      prompt += `El usuario te ha saludado con: "${promptUsuario}". Responde con un saludo cordial en español antes de continuar. `;
    }

    if (pidePlan) {
      const asignaturas = [
        'lengua y literatura',
        'matemática',
        'creciendo en valores',
        'ciencias naturales',
        'ciencias sociales',
        'inglés',
        'educación física',
        'derecho y dignidad de la mujer',
        'a.e.p',
        'taller de arte y cultura'
      ];
      const especificaAsignatura = asignaturas.find(asignatura => lowerPrompt.includes(asignatura));
      const especificaGrado = lowerPrompt.match(/(\d+\.?\d*)\s*(grado|de primaria)/i);
      const especificaTema = lowerPrompt.match(/(sobre|tema)\s+(.+?)(?=\s+(para|en|$))/i);
      const especificaSecciones = lowerPrompt.match(/(\d+\w*)\s*(y|o)\s*(\d+\w*)/i);

      const temasPredeterminados = {
        'lengua y literatura': 'Elementos de un texto narrativo',
        'matemática': 'Multiplicación de fracciones',
        'creciendo en valores': 'El respeto en la convivencia',
        'ciencias naturales': 'El ciclo del agua',
        'ciencias sociales': 'La independencia de Centroamérica',
        'inglés': 'Saludos e introducciones básicas',
        'educación física': 'Coordinación y trabajo en equipo',
        'derecho y dignidad de la mujer': 'Igualdad de género',
        'a.e.p': 'Resolución de conflictos',
        'taller de arte y cultura': 'Técnicas de dibujo básico'
      };

      if (!especificaAsignatura) {
        prompt += `El usuario ha solicitado un plan de clases con: "${promptUsuario}", pero no especificó la asignatura. Responde únicamente con: "Por favor, especifica la asignatura para la cual deseas el plan de clases, como Lengua y Literatura, Matemática, Creciendo en Valores, Ciencias Naturales, Ciencias Sociales, Inglés, Educación Física, Derecho y Dignidad de la Mujer, A.E.P o Taller de Arte y Cultura."`;
      } else if (!asignaturas.includes(especificaAsignatura)) {
        prompt += `El usuario ha especificado una asignatura no válida: "${especificaAsignatura}". Responde únicamente con: "La asignatura especificada no está en la lista de asignaturas válidas (Lengua y Literatura, Matemática, Creciendo en Valores, Ciencias Naturales, Ciencias Sociales, Inglés, Educación Física, Derecho y Dignidad de la Mujer, A.E.P, Taller de Arte y Cultura). Por favor, selecciona una asignatura válida."`;
      } else {
        prompt += `El usuario ha solicitado un plan de clases: "${promptUsuario}". Genera un plan de clases en español basado exclusivamente en el contenido del PDF cargado si está disponible y válido, que probablemente es un libro de texto. Identifica secciones relevantes del PDF (como capítulos, unidades o encabezados) que correspondan a la asignatura "${especificaAsignatura}" y el tema ${especificaTema ? '"' + especificaTema[2] + '"' : 'no especificado'}. Si el PDF no contiene información relevante o no está disponible, utiliza el libro de 5to grado de primaria de la colección 'libros' o, como última opción, el tema predeterminado "${temasPredeterminados[especificaAsignatura]}". Si usas un fallback, indica explícitamente en la respuesta: "El PDF cargado no contiene información suficiente; se usó contenido de la colección 'libros' o un tema predeterminado."

El plan debe estar estructurado en el siguiente formato, utilizando sintaxis de markdown para la tabla, con columnas alineadas y todas las secciones completas. Incorpora la asignatura "${especificaAsignatura}", grado ${especificaGrado ? especificaGrado[1] + ' de primaria' : '5to de primaria'}, y tema ${especificaTema ? '"' + especificaTema[2] + '"' : 'relevante del contexto o predeterminado'}. Si se especifican múltiples secciones de grado (por ejemplo, "5to A y 5to B"), incluye ambas en el campo Grado con horarios diferentes.

**PLAN DIARIO**  
**Asignatura:** ${especificaAsignatura.charAt(0).toUpperCase() + especificaAsignatura.slice(1)}  
**Grado:** ${especificaGrado ? especificaGrado[1] : '5to'} “A” Hora: 07:00 AM${especificaSecciones ? `\n${especificaGrado ? especificaGrado[1] : '5to'} “${especificaSecciones[3].replace(/\d+/, '')}” Hora: 09:20 AM` : ''}  
**Unidad:** [Especificar la unidad basada en el PDF, por ejemplo, Unidad V, o inferida del contexto]  
**Indicador de logro:** [Especificar un objetivo claro basado en el PDF, por ejemplo, ${especificaAsignatura === 'matemática' ? 'Utiliza la multiplicación de fracciones en contextos cotidianos' : especificaAsignatura === 'lengua y literatura' ? 'Analiza textos narrativos para identificar sus elementos principales' : 'Aplica conceptos relevantes de la asignatura'}]  
**Contenido:** [Especificar el tema basado en el PDF, por ejemplo, ${especificaTema ? especificaTema[2] : temasPredeterminados[especificaAsignatura]}]  
**C1:** [Criterio de evaluación 1 basado en el PDF, por ejemplo, ${especificaAsignatura === 'matemática' ? 'Emplea la multiplicación de fracciones en problemas cotidianos' : especificaAsignatura === 'lengua y literatura' ? 'Identifica los personajes y el ambiente en textos narrativos' : 'Demuestra comprensión del tema'}]  
**C2:** [Criterio de evaluación 2 basado en el PDF, por ejemplo, ${especificaAsignatura === 'matemática' ? 'Utiliza la simplificación en la multiplicación de fracciones' : especificaAsignatura === 'lengua y literatura' ? 'Resume el argumento principal de un texto narrativo' : 'Aplica el tema en un contexto práctico'}]  

| Pasos tiempo | Actividades del docente | Posibles reacciones de los niños y niñas | Evaluación |
|--------------|-------------------------|-----------------------------------------|------------|
| Presentación del problema (7 min) | [Actividad inicial basada en el PDF, por ejemplo, "${especificaAsignatura === 'matemática' ? 'Presentar un problema de fracciones del libro' : especificaAsignatura === 'lengua y literatura' ? 'Leer un texto narrativo del libro' : especificaAsignatura === 'ciencias naturales' ? 'Mostrar un diagrama del ciclo del agua del libro' : 'Introducir el tema con una actividad del libro'}"] | [Reacciones, por ejemplo, Participan activamente, reflexionan sobre el contenido] | [Evaluación, por ejemplo, Comprobar asimilación del contenido] |
| Solución individual (25 min) | [Actividad principal, por ejemplo, Resolver ejercicios del PDF, seleccionar estudiantes para compartir en la pizarra] | [Reacciones, por ejemplo, Resuelven con interés, algunos muestran dificultades] | [Evaluación, por ejemplo, Observar si aplican el contenido del libro] |
| Conclusión (5 min) | [Cierre basado en el PDF, por ejemplo, "${especificaAsignatura === 'matemática' ? 'Explicar la importancia de simplificar fracciones' : especificaAsignatura === 'lengua y literatura' ? 'Resumir los elementos del texto narrativo' : especificaAsignatura === 'ciencias naturales' ? 'Reforzar la importancia del agua' : 'Reforzar los aprendizajes clave'}"] | [Reacciones, por ejemplo, Escuchan atentamente, anotan el recordatorio] | [Evaluación, por ejemplo, Observar si atienden con disciplina] |
| Ejercicios (8 min) | [Ejercicios basados en el PDF, por ejemplo, "${especificaAsignatura === 'matemática' ? 'Resolver ejercicios de fracciones del libro' : especificaAsignatura === 'lengua y literatura' ? 'Escribir un resumen del texto leído' : especificaAsignatura === 'ciencias naturales' ? 'Dibujar el ciclo del agua' : 'Realizar una actividad práctica'}", incluir pregunta como "¿Cómo se relaciona esto con el contenido del libro?"] | [Reacciones, por ejemplo, Resuelven ejercicios, discuten en grupo] | [Evaluación, por ejemplo, Constatar si resuelven correctamente] |

**Tarea:** [Tarea basada en el PDF, por ejemplo, ${especificaAsignatura === 'matemática' ? 'Resolver problemas de fracciones del libro' : especificaAsignatura === 'lengua y literatura' ? 'Escribir un párrafo sobre un personaje del texto' : especificaAsignatura === 'ciencias naturales' ? 'Escribir sobre la importancia del agua' : 'Realizar una tarea práctica'}]

Asegúrate de que el plan sea adecuado para estudiantes de ${especificaGrado ? especificaGrado[1] + ' de primaria' : 'quinto grado de primaria'} y esté en español. Usa la sintaxis de markdown para la tabla, asegurándote de que las columnas estén alineadas y claras. Razonamiento: Analiza el PDF para encontrar capítulos o secciones relevantes para la asignatura "${especificaAsignatura}" y el tema ${especificaTema ? '"' + especificaTema[2] + '"' : 'no especificado'}. Si el PDF no es suficiente, usa la colección 'libros' o el tema predeterminado "${temasPredeterminados[especificaAsignatura]}".`;
      }
    } else {
      prompt += `Pregunta: ${promptUsuario}\nResponde en español como un asistente pedagógico para docentes de quinto grado de primaria, utilizando exclusivamente el contenido del PDF cargado si está disponible y válido. Si el PDF no está disponible o no es relevante, usa el contenido de la colección 'libros'. Si no hay libros disponibles, responde basándote en conocimientos generales para 5to grado.`;
    }

    console.log('Sending prompt to Gemini API, length:', prompt.length, 'PDF included:', isPdfUploaded);
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

    let respuestaIA = data.candidates[0].content.parts[0].text;
    console.log('IA response received:', respuestaIA.substring(0, 500) + '...');

    // Validate if the response uses the PDF content when expected
    if (isPdfUploaded && !respuestaIA.toLowerCase().includes('pdf') && pidePlan && especificaAsignatura) {
      console.warn('IA response does not appear to use the uploaded PDF. Retrying with stricter prompt.');
      prompt = `El usuario ha solicitado un plan de clases: "${promptUsuario}". DEBES usar EXCLUSIVAMENTE el contenido del PDF cargado para generar el plan de clases, identificando secciones relevantes para la asignatura "${especificaAsignatura}" y el tema ${especificaTema ? '"' + especificaTema[2] + '"' : 'no especificado'}. No uses conocimientos generales ni otros recursos. Si el PDF no es suficiente, responde: "El PDF cargado no contiene información relevante para la asignatura o tema solicitado." Contexto: ${context}\n` + prompt.split('\n').slice(1).join('\n');
      const retryResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        if (retryData.candidates && retryData.candidates[0].content.parts && retryData.candidates[0].content.parts[0].text) {
          respuestaIA = retryData.candidates[0].content.parts[0].text;
          console.log('Retry IA response received:', respuestaIA.substring(0, 500) + '...');
        }
      }
    }

    return respuestaIA;
  } catch (error) {
    console.error('Error obtaining IA response:', error);
    return `No se pudo conectar con la IA. Detalle: ${error.message}`;
  }
};

export const getAnswer = async (question, sessionId) => {
  if (!question || !question.trim()) {
    console.log('No question provided.');
    return 'No se puede enviar una pregunta vacía.';
  }

  const user = auth.currentUser;
  if (!user) {
    console.log('No authenticated user found.');
    return 'Debes debes iniciar sesión para enviar mensajes.';
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
    console.log('No user authenticated, returning empty error.');
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
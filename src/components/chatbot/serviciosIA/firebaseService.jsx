import { getDocs, collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../../database/firebaseconfig';
import * as pdfjsLib from 'pdfjs-dist';

// Usa una variable de entorno para la API Key de Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCr4IaBh12XZEMoLIxSjgqokiobm8_ws0M";

export const getAnswerFromFirebase = async (question) => {
  try {
    const docsSnap = await getDocs(collection(db, 'libros'));
    let context = '';

    // Recopilar URLs de PDFs
    const pdfUrls = [];
    docsSnap.forEach(doc => {
      const data = doc.data();
      if (data.pdfUrl) {
        pdfUrls.push(data.pdfUrl);
      }
    });

    // Descarga y lectura de PDFs
    if (pdfUrls.length === 0) {
      context = 'No se encontraron libros en la base de datos.';
    } else {
      // Limitar la cantidad de PDFs a procesar para evitar bloqueos
      const maxPdfs = 3;
      for (let i = 0; i < Math.min(pdfUrls.length, maxPdfs); i++) {
        const pdfUrl = pdfUrls[i];
        try {
          const response = await fetch(pdfUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const pdfData = await response.arrayBuffer();
          const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;
          let pdfText = '';

          // Limitar páginas por PDF para evitar respuestas demasiado largas
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

    // Construir el prompt para Gemini
    const prompt = `Contexto educativo: ${context}\nPregunta: ${question}\nResponde como un asistente pedagógico para docentes de quinto grado de primaria.`;

    // Llamada a la API de Gemini
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    let data;
    let answer;
    try {
      const response = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      });

      data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Error desconocido al consultar Gemini');
      }
      console.log('Respuesta de Gemini:', data);
    } catch (apiError) {
      answer = `Ocurrió un error al consultar la IA de Gemini: ${apiError.message || apiError}`;
      await saveChatHistory(question, answer);
      return answer;
    }

    if (data && data.candidates && data.candidates.length > 0) {
      answer = (data.candidates[0].content.parts[0].text || 'No se pudo obtener una respuesta adecuada.').trim();
    } else if (data && data.error) {
      answer = `Error de Gemini: ${data.error.message || 'No se pudo obtener una respuesta adecuada.'}`;
    } else {
      answer = 'No se pudo obtener una respuesta adecuada.';
    }

    // Guarda la consulta y respuesta en Firestore
    await saveChatHistory(question, answer);
    return answer;
  } catch (error) {
    const answer = `Ocurrió un error al obtener la respuesta: ${error.message || error}`;
    await saveChatHistory(question, answer);
    return answer;
  }
};

// Guarda la consulta y respuesta en Firestore
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
 
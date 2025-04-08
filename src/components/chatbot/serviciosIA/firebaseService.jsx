import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../database/firebaseconfig';
import { getStorage,} from 'firebase/storage';
import * as pdfjsLib from 'pdfjs-dist';

// API Key de OpenAI
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // Usando una variable de entorno

export const getAnswerFromFirebase = async (question) => {
  try {
    const docsSnap = await getDocs(collection(db, 'libros')); // Accede a la colección "libros"
    let context = '';

    // Accede al storage de Firebase para obtener las URLs de los PDFs
    const storage = getStorage();
    const pdfUrls = [];

    docsSnap.forEach(doc => {
      const data = doc.data();
      if (data.pdfUrl) {
        pdfUrls.push(data.pdfUrl);
      }
    });

    // Extraer texto de cada PDF y agregarlo al contexto
    for (let pdfUrl of pdfUrls) {
      const pdfData = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDocument = await pdfjsLib.getDocument(pdfData).promise;
      let pdfText = '';

      // Leer cada página del PDF
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        pdfText += pageText + '\n';
      }

      context += `Contenido del PDF: \n${pdfText}\n`;
    }

    const prompt = `
      Contexto educativo: ${context}
      Pregunta: ${question}
      Responde como un asistente pedagógico para docentes de quinto grado de primaria.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No se pudo obtener una respuesta adecuada.';
  } catch (error) {
    console.error('Error consultando la IA:', error);
    return 'Ocurrió un error al obtener la respuesta.';
  }
};
 
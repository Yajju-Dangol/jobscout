import * as pdfjsLib from 'pdfjs-dist';

// Ensure PDF.js worker is initialized
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Use CDN worker matching installed version to avoid Vite asset bundler issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface DocumentMediaPart {
  mimeType: string;
  /** Base64 string without data: URL prefix */
  data: string;
}

export interface ProcessedDocument {
  text: string;
  images: DocumentMediaPart[];
  pdfBase64?: DocumentMediaPart;
  fileName: string;
  fileType: string;
}

/**
 * Converts a File or Blob into base64 raw string (without data:* prefix)
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts text and renders page images from a PDF file using PDF.js
 */
export async function extractFromPdf(arrayBuffer: ArrayBuffer, maxPages = 4): Promise<{
  text: string;
  pageImages: DocumentMediaPart[];
}> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    const numPages = Math.min(pdf.numPages, maxPages);

    let fullText = '';
    const pageImages: DocumentMediaPart[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // 1. Extract digital text items
      const textContent = await page.getTextContent();
      const pageLines: string[] = [];
      let currentLine = '';
      let lastY: number | null = null;

      for (const item of textContent.items as any[]) {
        if ('str' in item) {
          const str = item.str;
          const y = item.transform ? item.transform[5] : null;

          if (lastY !== null && y !== null && Math.abs(y - lastY) > 6) {
            if (currentLine.trim()) {
              pageLines.push(currentLine.trim());
            }
            currentLine = str;
          } else {
            currentLine += (currentLine ? ' ' : '') + str;
          }
          lastY = y;
        }
      }
      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }
      const pageText = pageLines.join('\n');
      if (pageText.trim()) {
        fullText += (fullText ? '\n\n' : '') + `--- Page ${pageNum} ---\n` + pageText;
      }

      // 2. Render page to Canvas for high-fidelity visual image input to Gemini
      try {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          const dataUrl = canvas.toDataURL('image/png', 0.9);
          const base64 = dataUrl.split(',')[1];
          if (base64) {
            pageImages.push({
              mimeType: 'image/png',
              data: base64,
            });
          }
        }
      } catch (renderErr) {
        console.warn(`[PDF Page ${pageNum} Render note]:`, renderErr);
      }
    }

    return {
      text: fullText.trim(),
      pageImages,
    };
  } catch (pdfErr) {
    console.warn('[PDF.js extraction failed]:', pdfErr);
    return { text: '', pageImages: [] };
  }
}

/**
 * Universal document processor:
 * - PDFs: Extracts clean text + converts pages into high-res PNG images + attaches raw PDF base64
 * - Images (PNG/JPG/WEBP): Converts to Base64 image media
 * - Text/MD: Reads UTF-8 text
 */
export async function processDocumentFile(file: File): Promise<ProcessedDocument> {
  const fileName = file.name;
  const lowerName = fileName.toLowerCase();
  const fileType = file.type || '';

  // 1. Text & Markdown files
  if (fileType.includes('text') || lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
    const text = await file.text();
    return {
      text,
      images: [],
      fileName,
      fileType: 'text/plain',
    };
  }

  // 2. Direct Image files (PNG, JPG, JPEG, WEBP)
  if (fileType.startsWith('image/') || lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp')) {
    const base64 = await fileToBase64(file);
    const mimeType = fileType || (lowerName.endsWith('.png') ? 'image/png' : 'image/jpeg');
    return {
      text: '',
      images: [{ mimeType, data: base64 }],
      fileName,
      fileType: mimeType,
    };
  }

  // 3. PDF Files
  if (fileType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfBase64Str = await fileToBase64(file);

    // Extract text & render page images
    const { text, pageImages } = await extractFromPdf(arrayBuffer);

    return {
      text,
      images: pageImages,
      pdfBase64: {
        mimeType: 'application/pdf',
        data: pdfBase64Str,
      },
      fileName,
      fileType: 'application/pdf',
    };
  }

  // Generic fallback
  const text = await file.text();
  return {
    text,
    images: [],
    fileName,
    fileType: fileType || 'text/plain',
  };
}

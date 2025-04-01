import { PDFDocument } from 'pdf-lib'; // pdf-lib is still needed for basic PDF loading

// Helper to load PDF.js library dynamically if needed
const loadPdfJsIfNeeded = () => {
  if (window.pdfjsLib) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'; // Use a reliable CDN
    script.onload = () => {
      // IMPORTANT: Set workerSrc directly after loading
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      console.log("PDF.js loaded.");
      resolve();
    };
    script.onerror = (err) => {
      console.error("Failed to load PDF.js script:", err);
      reject(new Error("Failed to load PDF processing library. Please check your internet connection and try again."));
    };
    document.head.appendChild(script);
  });
};

// Helper to extract text using PDF.js
const extractTextWithPdfJs = async (arrayBuffer) => {
  try {
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let extractedText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // Join items with spaces, and pages with double newlines for better separation
      const pageText = textContent.items.map(item => item.str).join(' ');
      extractedText += pageText + (i < pdf.numPages ? '\n\n' : ''); // Add double newline between pages
    }
    return extractedText.trim(); // Trim leading/trailing whitespace
  } catch (error) {
     console.error("Error during PDF.js text extraction:", error);
     throw new Error(`Failed to extract text using PDF.js: ${error.message}`);
  }
};

// Main function to extract text from a PDF file
export const extractTextFromPdf = async (file, onProgress) => {
  try {
    onProgress(10); // Initial progress
    const arrayBuffer = await file.arrayBuffer();
    onProgress(30);

    // Attempt to load the PDF with pdf-lib first to check if it's valid
    // Although we won't use pdf-lib for text extraction here, it's good validation
    await PDFDocument.load(arrayBuffer);
    onProgress(50);

    // Ensure PDF.js is loaded
    await loadPdfJsIfNeeded();
    onProgress(60);

    // Extract text using PDF.js
    const extractedText = await extractTextWithPdfJs(arrayBuffer);
    onProgress(100); // Done

    return extractedText;
  } catch (err) {
    console.error('Error extracting text from PDF:', err);
    // Rethrow a user-friendly error
    throw new Error(`Failed to process PDF: ${err.message}`);
  }
};
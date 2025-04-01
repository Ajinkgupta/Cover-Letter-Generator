// Function to load jsPDF dynamically
const loadJsPdfIfNeeded = () => {
    if (window.jspdf && window.jspdf.jsPDF) {
       return Promise.resolve();
    }
  
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // Use the UMD version for broader compatibility
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
          console.log("jsPDF loaded.");
          resolve();
       };
      script.onerror = (err) => {
          console.error("Failed to load jsPDF script:", err);
          reject(new Error("Failed to load PDF generation library. Please check your internet connection and try again."));
      };
      document.head.appendChild(script);
    });
  };
  
  
  // Function to download cover letter as DOCX
  export const downloadAsDOCX = (editableCoverLetter, fileName = 'Cover_Letter.docx') => {
    if (!editableCoverLetter || editableCoverLetter.length === 0) return;
  
    // Create HTML content ensuring proper paragraph breaks recognized by Word
    const htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Cover Letter</title>
        <!-- Define basic styles Word can interpret -->
        <style>
          body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.15; margin: 1in; } /* Standard margins */
          p { margin-bottom: 10pt; margin-top: 0; }
          .salutation { margin-bottom: 12pt; } /* Space after salutation */
          .closing { margin-top: 12pt; margin-bottom: 4pt; } /* Space before closing */
          .name { font-weight: normal; margin-top:0; } /* Ensure name is not bold unless specified */
        </style>
      </head>
      <body>
        ${editableCoverLetter.map(para => {
            // Add specific classes for potential styling
            let className = '';
            if (para.type === 'salutation') className = 'salutation';
            else if (para.type === 'closing') className = 'closing';
            else if (para.type === 'name') className = 'name';
            // Replace newline characters within a paragraph with line breaks Word might understand
            const textWithBreaks = para.text.replace(/\n/g, '<br/>');
            return `<p class="${className}">${textWithBreaks}</p>`;
         }).join('\n')}
      </body>
      </html>
    `;
  
    // Use Blob to create the file
    const blob = new Blob(['\ufeff', htmlContent], { // Add BOM for better UTF-8 support in Word
      type: 'application/msword' // Correct MIME type for .doc/.docx from HTML
    });
  
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(link.href); // Free up memory
  };
  
  
  // Function to download cover letter as PDF using jsPDF
  export const downloadAsPDF = async (editableCoverLetter, fileName = 'Cover_Letter.pdf') => {
    if (!editableCoverLetter || editableCoverLetter.length === 0) return;
  
    try {
      await loadJsPdfIfNeeded(); // Ensure jsPDF is loaded
  
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4', // Standard A4 size
        orientation: 'portrait'
      });
  
      // Set document properties (optional)
      doc.setProperties({
        title: 'Cover Letter',
        // subject: 'Job Application',
        // author: userName, // Consider passing userName if available
        // keywords: 'cover letter, application',
        // creator: 'AI Cover Letter Generator'
      });
  
      // Define fonts and sizes
      const FONT_NORMAL = 'helvetica'; // Standard, widely supported font
      const FONT_BOLD = 'helvetica'; // jsPDF uses style specifier
      const FONT_SIZE = 11; // Corresponds roughly to 11pt
      const LINE_HEIGHT_MM = 5; // Line height in mm
      const PARAGRAPH_SPACING_MM = 3; // Basic spacing between paragraphs
      const SALUTATION_SPACING_MM = 6; // Extra space after salutation
      const CLOSING_SPACING_MM = 8; // Extra space before closing
  
      // Margins (in mm) - standard 1 inch approx 25.4mm
      const MARGIN_TOP = 25.4;
      const MARGIN_LEFT = 25.4;
      const MARGIN_RIGHT = 25.4;
      const MARGIN_BOTTOM = 25.4;
  
      const pageWidth = doc.internal.pageSize.getWidth() - MARGIN_LEFT - MARGIN_RIGHT;
      const pageHeight = doc.internal.pageSize.getHeight();
  
      let currentY = MARGIN_TOP;
  
      // Function to add text and handle page breaks
      const addText = (text, options = {}) => {
        const { fontStyle = 'normal', extraSpacing = 0 } = options;
  
        doc.setFont(FONT_NORMAL, fontStyle); // Set font style for this segment
        doc.setFontSize(FONT_SIZE);
  
        const splitText = doc.splitTextToSize(text, pageWidth); // Wrap text
  
        const textHeight = splitText.length * LINE_HEIGHT_MM;
        const requiredHeight = textHeight + extraSpacing;
  
        // Check if content fits on the current page
        if (currentY + requiredHeight > pageHeight - MARGIN_BOTTOM) {
          doc.addPage();
          currentY = MARGIN_TOP; // Reset Y position for the new page
        }
  
        // Add the text lines
        doc.text(splitText, MARGIN_LEFT, currentY);
        currentY += textHeight; // Move Y down by the height of the text added
      };
  
  
      editableCoverLetter.forEach((paragraph, index) => {
         let fontStyle = 'normal';
         let spacingAfter = PARAGRAPH_SPACING_MM;
  
         // Adjust styling/spacing based on paragraph type
         if (paragraph.type === 'salutation') {
           spacingAfter = SALUTATION_SPACING_MM;
         } else if (paragraph.type === 'closing') {
           // Add space *before* the closing if the previous was content
           if (index > 0 && editableCoverLetter[index - 1].type === 'content') {
               currentY += CLOSING_SPACING_MM - PARAGRAPH_SPACING_MM; // Add extra space before
           }
         } else if (paragraph.type === 'name') {
           // fontStyle = 'bold'; // Decided against bold name for standard look
           spacingAfter = 0; // No extra space after name usually
         }
  
         addText(paragraph.text, { fontStyle });
         currentY += spacingAfter; // Add spacing *after* the paragraph
      });
  
      doc.save(fileName);
  
    } catch (err) {
      console.error('PDF generation error:', err);
      // Propagate the error so it can be shown to the user
      throw new Error(`Failed to generate PDF: ${err.message}`);
    }
  };
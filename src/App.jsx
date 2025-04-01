import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { extractTextFromPdf } from './services/pdfService';
import { generateCoverLetterAPI } from './services/groqService';
import { downloadAsDOCX, downloadAsPDF } from './services/downloadService';

import Layout from './components/Layout';
import InputForm from './components/InputForm';
import CoverLetterDisplay from './components/CoverLetterDisplay';
import LoadingSpinner from './components/LoadingSpinner'; // Import spinner

function App() {
  // State using custom hook for persistence
  const [resumeText, setResumeText] = useLocalStorage('resumeText', '');
  const [jobDescription, setJobDescription] = useLocalStorage('jobDescription', '');
  const [apiKey, setApiKey] = useLocalStorage('apiKey', ''); // Note: Storing API keys in localStorage has security implications in shared environments.
  const [userName, setUserName] = useLocalStorage('userName', '');
  const [salutation, setSalutation] = useLocalStorage('salutation', 'Dear Hiring Manager,');
  const [closing, setClosing] = useLocalStorage('closing', 'Sincerely,');
  const [fileName, setFileName] = useLocalStorage('fileName', ''); // Persist filename too

  // Component state
  const [rawCoverLetterBody, setRawCoverLetterBody] = useState(''); // Store the raw AI output
  const [editableCoverLetter, setEditableCoverLetter] = useState([]); // Formatted paragraphs for display/edit
  const [isLoading, setIsLoading] = useState(false); // Combined loading state
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false); // For copy feedback

  // Effect to structure the cover letter when raw body, salutation, closing, or name changes
  useEffect(() => {
    if (!rawCoverLetterBody) {
       setEditableCoverLetter([]); // Clear if no body
       return;
    }

    // Basic cleaning (remove potential leading/trailing noise)
    const cleanedContent = rawCoverLetterBody
       .replace(/^(Here is|I've created|Please find|Attached is|Below is).+?:/i, '')
       .trim();

    // Split into paragraphs, filter empty ones
    const bodyParagraphs = cleanedContent.split('\n\n')
       .map(p => p.trim())
       .filter(p => p.length > 0);

    // Construct the full letter structure for editing
    const completeLetter = [];
    if (salutation) {
        completeLetter.push({ text: salutation, editing: false, type: 'salutation' });
    }
    bodyParagraphs.forEach(p => {
        completeLetter.push({ text: p, editing: false, type: 'content' });
    });
    if (closing) {
        completeLetter.push({ text: closing, editing: false, type: 'closing' });
    }
    if (userName) {
        completeLetter.push({ text: userName, editing: false, type: 'name' });
    }

    setEditableCoverLetter(completeLetter);
    setEditMode(false); // Exit edit mode when new letter is generated

  }, [rawCoverLetterBody, userName, salutation, closing]);


  // File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name); // Show filename immediately
    setIsLoading(true);
    setError('');
    setResumeText(''); // Clear previous text
    setUploadProgress(0); // Reset progress

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        // Pass progress callback to extractor
        text = await extractTextFromPdf(file, setUploadProgress);
      } else if (file.type === 'text/plain') {
        setUploadProgress(50); // Simulate progress for TXT
        text = await file.text();
        setUploadProgress(100);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or TXT.');
      }
      setResumeText(text);
       // Reset progress slightly delayed for UX
       setTimeout(() => setUploadProgress(0), 1500);

    } catch (err) {
      setError(err.message || 'Failed to process file');
      setFileName(''); // Clear filename on error
      setUploadProgress(0); // Reset progress on error
    } finally {
      setIsLoading(false);
       // Clear the file input value so the same file can be uploaded again
      if (e.target) {
          e.target.value = null;
      }
    }
  };

  // Generate Cover Letter Handler
  const generateCoverLetter = useCallback(async () => {
    // Simple validation check
    if (!resumeText || !jobDescription || !apiKey || !userName || !salutation || !closing) {
      setError('Please fill in all required fields (*) including API Key, Resume, Job Description, Name, Salutation, and Closing.');
      return;
    }

    setIsLoading(true);
    setError('');
    setRawCoverLetterBody(''); // Clear previous raw body
    setEditableCoverLetter([]); // Clear display immediately
    setEditMode(false); // Ensure not in edit mode

    try {
      const generatedBody = await generateCoverLetterAPI(apiKey, resumeText, jobDescription);
      setRawCoverLetterBody(generatedBody); // Store the raw body from API
    } catch (err) {
       console.error("Generation failed:", err);
       // Ensure error is a string message
       setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, resumeText, jobDescription, userName, salutation, closing]); // Dependencies for useCallback


  // Download Handlers
  const handleDownloadDOCX = () => {
     try {
         downloadAsDOCX(editableCoverLetter, `${userName.replace(/\s+/g, '_')}_Cover_Letter.docx`);
     } catch (err) {
         setError(`Failed to download DOCX: ${err.message}`);
     }
  };

  const handleDownloadPDF = async () => {
    setIsLoading(true); // Show loading indicator for PDF generation
    setError('');
     try {
         await downloadAsPDF(editableCoverLetter, `${userName.replace(/\s+/g, '_')}_Cover_Letter.pdf`);
     } catch (err) {
         setError(`Failed to download PDF: ${err.message}`);
     } finally {
         setIsLoading(false);
     }
  };

  // Copy Handler
   const handleCopyText = (textToCopy) => {
       navigator.clipboard.writeText(textToCopy)
           .then(() => {
               setCopySuccess(true);
               setTimeout(() => setCopySuccess(false), 2000); // Hide message after 2s
           })
           .catch(err => {
               console.error('Failed to copy text: ', err);
               setError('Failed to copy text to clipboard.');
           });
   };


  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
         {/* Input Section */}
         <InputForm
            apiKey={apiKey} setApiKey={setApiKey}
            resumeText={resumeText} setResumeText={setResumeText}
            jobDescription={jobDescription} setJobDescription={setJobDescription}
            userName={userName} setUserName={setUserName}
            salutation={salutation} setSalutation={setSalutation}
            closing={closing} setClosing={setClosing}
            fileName={fileName}
            uploadProgress={uploadProgress}
            isGenerating={isLoading && !uploadProgress} // Only show generating spinner if not uploading
            error={error} // Pass error down
            handleFileUpload={handleFileUpload}
            generateCoverLetter={generateCoverLetter}
         />

         {/* Loading indicator during generation */}
         {isLoading && !uploadProgress && !error && (
           <div className="text-center py-6">
             <LoadingSpinner />
             <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Generating your cover letter...</p>
           </div>
         )}

         {/* Output Section - Conditionally rendered */}
         {/* Render even if loading to avoid layout shifts, but disable buttons */}
         {(editableCoverLetter.length > 0 || isLoading) && !error && (
            <CoverLetterDisplay
                editableCoverLetter={editableCoverLetter}
                setEditableCoverLetter={setEditableCoverLetter}
                editMode={editMode}
                setEditMode={setEditMode}
                userName={userName}
                salutation={salutation}
                closing={closing}
                onDownloadDOCX={handleDownloadDOCX}
                onDownloadPDF={handleDownloadPDF}
                onCopyText={handleCopyText}
                isLoading={isLoading} // Pass loading state to disable buttons
            />
         )}

         {/* Copy Success Message */}
         {copySuccess && (
             <div
                 aria-live="assertive"
                 className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
             >
                 <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                     <div className="max-w-sm w-full bg-green-50 dark:bg-green-900 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
                         <div className="p-4">
                             <div className="flex items-start">
                                 <div className="flex-shrink-0">
                                     <CheckCircleIcon className="h-6 w-6 text-green-400 dark:text-green-500" aria-hidden="true" />
                                 </div>
                                 <div className="ml-3 w-0 flex-1 pt-0.5">
                                     <p className="text-sm font-medium text-green-800 dark:text-green-200">Successfully Copied!</p>
                                     <p className="mt-1 text-sm text-green-700 dark:text-green-300">Cover letter text copied to clipboard.</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
         )}

      </div>
    </Layout>
  );
}

// Assume CheckCircleIcon is imported from heroicons
import { CheckCircleIcon } from '@heroicons/react/24/solid'; // Using solid version for success


export default App;
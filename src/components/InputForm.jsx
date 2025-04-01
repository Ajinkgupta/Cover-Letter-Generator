import React, { useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

const InputForm = ({
  apiKey, setApiKey,
  resumeText, setResumeText,
  jobDescription, setJobDescription,
  userName, setUserName,
  salutation, setSalutation,
  closing, setClosing,
  fileName,
  uploadProgress,
  isGenerating,
  error,
  handleFileUpload,
  generateCoverLetter,
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">1. Provide Your Details</h2>

      {/* API Key */}
      <div className="mb-6">
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Groq API Key <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Enter your Groq API key (gsk_...)"
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Required for generation. Stored only in your browser's local storage.
        </p>
      </div>

      {/* Resume and Job Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Resume Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Resume <span className="text-red-500">*</span>
          </label>
          <div className="mb-3">
             {/* File Upload Area */}
            <label htmlFor="resume-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <svg className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PDF or TXT files</p>
              </div>
              <input
                id="resume-file"
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
            </label>
            {/* File Name & Progress */}
            {fileName && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">File: {fileName}</p>}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-width duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
             {uploadProgress === 100 && !error && fileName && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">Processing complete.</p>
            )}
          </div>
          {/* Resume Text Area */}
          <textarea
            id="resume"
            rows="10"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Paste resume text or upload file..."
            required
          ></textarea>
           <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ensure key skills and experiences are present.
           </p>
        </div>

        {/* Job Description Input */}
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="jobDescription"
            rows="15" // Increased rows for better visibility
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Paste the full job description here..."
            required
          ></textarea>
           <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
             The more detail, the better the generated letter.
           </p>
        </div>
      </div>

      {/* User Details - Name, Salutation, Closing */}
       <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">2. Customize Letter Details</h3>
       <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Your Full Name"
            required
          />
        </div>
        <div>
          <label htmlFor="salutation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Salutation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="salutation"
            value={salutation}
            onChange={(e) => setSalutation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="e.g., Dear Hiring Manager,"
            required
          />
        </div>
        <div>
          <label htmlFor="closing" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Closing <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="closing"
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="e.g., Sincerely,"
            required
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-8 text-center">
        <button
          onClick={generateCoverLetter}
          disabled={isGenerating || !apiKey || !resumeText || !jobDescription || !userName || !salutation || !closing}
          className={`w-full sm:w-auto inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white
            ${isGenerating || !apiKey || !resumeText || !jobDescription || !userName || !salutation || !closing
              ? 'bg-indigo-300 dark:bg-indigo-800 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900'
            } transition-colors duration-200`}
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="w-5 h-5" color="text-white" />
              <span className="ml-2">Generating...</span>
            </>
          ) : (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                </svg>
                Generate Cover Letter
             </>
          )}
        </button>
         {!apiKey && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">API Key is required to generate.</p>}
         {apiKey && (!resumeText || !jobDescription || !userName || !salutation || !closing) && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Please fill in all required (*) fields.</p>}
      </div>

      {/* Error Display */}
      {error && !isGenerating && (
         // Enhanced Error Display
         <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-md">
           <div className="flex">
             <div className="flex-shrink-0">
               <svg className="h-5 w-5 text-red-400 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
               </svg>
             </div>
             <div className="ml-3">
               <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error Occurred</h3>
               <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                 <p>{error}</p>
               </div>
             </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default InputForm;
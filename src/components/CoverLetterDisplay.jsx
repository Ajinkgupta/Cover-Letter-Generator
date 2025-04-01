import React from 'react';
import {
  PencilSquareIcon, TrashIcon, PlusCircleIcon, CheckCircleIcon, XCircleIcon,
  DocumentDuplicateIcon, ArrowDownTrayIcon, ClipboardDocumentIcon
} from '@heroicons/react/24/outline'; // Assuming Heroicons are installed

const CoverLetterDisplay = ({
  editableCoverLetter,
  setEditableCoverLetter,
  editMode,
  setEditMode,
  userName, // Needed for context when adding paragraphs
  salutation,
  closing,
  onDownloadDOCX,
  onDownloadPDF,
  onCopyText,
  isLoading, // To disable buttons while generating
}) => {

  const toggleEditMode = () => setEditMode(!editMode);

  const handleParagraphEdit = (index) => {
    const newCoverLetter = editableCoverLetter.map((p, i) =>
      i === index ? { ...p, editing: true } : p
    );
    setEditableCoverLetter(newCoverLetter);
  };

  const handleParagraphChange = (index, newText) => {
    const newCoverLetter = [...editableCoverLetter];
    newCoverLetter[index].text = newText;
    setEditableCoverLetter(newCoverLetter);
  };

  const handleParagraphSave = (index) => {
    const newCoverLetter = [...editableCoverLetter];
    newCoverLetter[index].editing = false;
    setEditableCoverLetter(newCoverLetter);
  };

   const handleParagraphDelete = (index) => {
    // Prevent deletion of essential parts
    if (['salutation', 'closing', 'name'].includes(editableCoverLetter[index].type)) return;

    const confirmation = window.confirm("Are you sure you want to delete this paragraph?");
    if (confirmation) {
        const newCoverLetter = editableCoverLetter.filter((_, i) => i !== index);
        setEditableCoverLetter(newCoverLetter);
    }
   };


   const handleAddParagraph = (index) => {
     const newCoverLetter = [...editableCoverLetter];
     // Determine insertion point: Always before the 'closing' paragraph if possible
     let insertIndex = index + 1;
     const closingIndex = newCoverLetter.findIndex(p => p.type === 'closing');

     // If closing exists and the target index is at or after it, insert before closing
     if (closingIndex !== -1 && insertIndex >= closingIndex) {
         insertIndex = closingIndex;
     }
     // If closing doesn't exist (shouldn't happen with current logic, but safe check)
     // or if we're adding after the last element which isn't the name, add before name
     const nameIndex = newCoverLetter.findIndex(p => p.type === 'name');
     if (nameIndex !== -1 && insertIndex >= nameIndex) {
         insertIndex = nameIndex;
     }
     // If adding at the very beginning (index -1), make it the first content para
     if (index === -1 && newCoverLetter[0]?.type === 'salutation') {
         insertIndex = 1;
     } else if (index === -1) {
         insertIndex = 0; // Should ideally not happen if salutation exists
     }


     newCoverLetter.splice(insertIndex, 0, {
         text: 'New paragraph...',
         editing: true, // Start in editing mode
         type: 'content'
     });
     setEditableCoverLetter(newCoverLetter);
     // Scroll the new paragraph into view (optional, requires ref handling)
   };


  const getFullCoverLetterText = () => {
    return editableCoverLetter.map(p => p.text).join('\n\n');
  };

  const handleCopy = () => {
    onCopyText(getFullCoverLetterText());
    // Optional: Add feedback like changing button text temporarily
  };


  if (!editableCoverLetter || editableCoverLetter.length === 0) {
    return (
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">3. Your Generated Cover Letter</h2>
            <p className="text-gray-500 dark:text-gray-400">
                Generate a cover letter using the form above. The result will appear here.
            </p>
       </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Review & Refine Your Letter</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleEditMode}
            disabled={isLoading}
            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              editMode
                ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {editMode ? (
               <> <XCircleIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> Exit Edit Mode </>
            ) : (
               <> <PencilSquareIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> Edit Letter </>
            )}
          </button>
           {/* Add Paragraph Button (only in edit mode) */}
           {editMode && (
             <button
                onClick={() => handleAddParagraph(editableCoverLetter.findIndex(p => p.type === 'salutation'))} // Add after salutation
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
             >
                <PlusCircleIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" /> Add Paragraph
             </button>
           )}
        </div>
      </div>

       {/* Download/Copy Buttons (always visible if letter exists) */}
       <div className="flex flex-wrap gap-2 mb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
           <button
                onClick={handleCopy}
                disabled={isLoading}
                title="Copy full letter text to clipboard"
                className={`inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
                <ClipboardDocumentIcon className="h-4 w-4 mr-2" aria-hidden="true" /> Copy Text
           </button>
           <button
                onClick={onDownloadDOCX}
                disabled={isLoading}
                title="Download as Microsoft Word (.docx)"
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" aria-hidden="true" /> DOCX
           </button>
           <button
                onClick={onDownloadPDF}
                disabled={isLoading}
                title="Download as PDF"
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" aria-hidden="true" /> PDF
           </button>
       </div>


      {/* Cover Letter Content */}
      <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none space-y-4">
         {editableCoverLetter.map((paragraph, index) => (
           <div
             key={index}
             className={`relative group transition-all duration-200 ease-in-out
               ${editMode ? 'p-3 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-md hover:border-indigo-500 dark:hover:border-indigo-500' : ''}
               ${paragraph.editing ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
           >
             {/* Content Area */}
             {paragraph.editing ? (
               // Editing View
               <textarea
                 value={paragraph.text}
                 onChange={(e) => handleParagraphChange(index, e.target.value)}
                 className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[60px] resize-y" // Ensure min height and allow vertical resize
                 rows={Math.max(3, paragraph.text.split('\n').length)} // Auto-adjust rows roughly
                 autoFocus // Focus when editing starts
               />
             ) : (
               // Display View
               <p className={`whitespace-pre-wrap ${paragraph.type === 'name' ? 'font-medium' : ''}`}>
                 {paragraph.text}
               </p>
             )}

             {/* Action Buttons in Edit Mode */}
             {editMode && (
               <div className={`mt-2 flex ${paragraph.editing ? 'justify-end' : 'justify-start'} space-x-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 ${paragraph.editing ? 'opacity-100' : ''}`}>
                 {paragraph.editing ? (
                   // Save Button
                   <button
                     onClick={() => handleParagraphSave(index)}
                     title="Save changes to this paragraph"
                     className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
                   >
                     <CheckCircleIcon className="h-4 w-4 mr-1" /> Save
                   </button>
                 ) : (
                   // Edit Button
                   <button
                     onClick={() => handleParagraphEdit(index)}
                      title="Edit this paragraph"
                     className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                   >
                      <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                   </button>
                 )}

                 {/* Delete and Add Buttons (only for 'content' type and when *not* actively editing) */}
                 {paragraph.type === 'content' && !paragraph.editing && (
                   <>
                     <button
                       onClick={() => handleParagraphDelete(index)}
                        title="Delete this paragraph"
                       className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded shadow-sm text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                     >
                        <TrashIcon className="h-4 w-4 mr-1" /> Delete
                     </button>
                     <button
                       onClick={() => handleAddParagraph(index)}
                        title="Add a new paragraph below this one"
                       className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                     >
                        <PlusCircleIcon className="h-4 w-4 mr-1" /> Add Below
                     </button>
                   </>
                 )}
               </div>
             )}
           </div>
         ))}
      </div>
    </div>
  );
};

export default CoverLetterDisplay;
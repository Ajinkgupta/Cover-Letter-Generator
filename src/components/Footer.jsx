import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-center py-4 mt-12 transition-colors duration-300">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        © {currentYear} AI Cover Letter Generator. All rights reserved.
      </p>
       <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
         Your data (including API key) is processed locally in your browser and is not stored on any server.
       </p>
    </footer>
  );
};

export default Footer;
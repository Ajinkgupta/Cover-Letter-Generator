import { useState, useEffect } from 'react';

function getStorageValue(key, defaultValue) {
  // Getting stored value
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    try {
        const initial = saved ? JSON.parse(saved) : defaultValue;
        return initial;
    } catch (e) {
        // If JSON parsing fails, return the raw saved value or default
        console.warn(`Error parsing localStorage key “${key}”:`, e);
        return saved !== null ? saved : defaultValue;
    }
  }
  return defaultValue; // Return default value if window is not defined (SSR)
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // Storing value
    try {
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
    } catch (e) {
      console.error(`Error setting localStorage key “${key}”:`, e);
    }
  }, [key, value]);

  return [value, setValue];
};
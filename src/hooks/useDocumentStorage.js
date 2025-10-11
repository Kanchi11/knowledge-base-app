// hooks/useDocumentStorage.js
import { useState, useEffect } from 'react';

const DB_NAME = 'WandAI_KnowledgeBase';
const STORE_NAME = 'documents';
const DB_VERSION = 1;

const useDocumentStorage = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
      });
    };

    initDB()
      .then((database) => {
        setDb(database);
        return loadDocuments(database);
      })
      .then((docs) => {
        setDocuments(docs);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error initializing database:', error);
        setIsLoading(false);
      });
  }, []);

  // Load all documents
  const loadDocuments = (database) => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  };

  // Add document
  const addDocument = async (document) => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(document);

      request.onsuccess = () => {
        setDocuments(prev => [...prev, document]);
        resolve(document);
      };
      request.onerror = () => reject(request.error);
    });
  };

  // Delete document
  const deleteDocument = async (id) => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  };

  // Clear all documents
  const clearAllDocuments = async () => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        setDocuments([]);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  };

  return {
    documents,
    isLoading,
    addDocument,
    deleteDocument,
    clearAllDocuments
  };
};

export default useDocumentStorage;
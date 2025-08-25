// src/hooks/useFileUpload.js
import { useState } from 'react';

const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const uploadFile = async (file, teamId) => {
    if (!file) return null;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teamId', teamId);

      const response = await fetch(`${API_BASE}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        return data.file;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return {
    uploadFile,
    uploading,
    uploadProgress
  };
};

export default useFileUpload;

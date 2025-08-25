// src/components/FileUpload.js
import React, { useRef } from 'react';
import { FaPaperclip, FaImage, FaFile, FaTimes } from 'react-icons/fa';

const FileUpload = ({ onFileSelect, uploading, uploadProgress, selectedFile, onRemoveFile }) => {
  const fileInputRef = useRef();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FaImage className="file-icon image" />;
    }
    return <FaFile className="file-icon document" />;
  };

  return (
    <div className="file-upload-container">
      <button
        className="file-upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        title="Attach file"
      >
        <FaPaperclip />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
      />

      {selectedFile && (
        <div className="selected-file-preview">
          <div className="file-info">
            {getFileIcon(selectedFile)}
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{formatFileSize(selectedFile.size)}</span>
            </div>
          </div>
          
          {uploading && (
            <div className="upload-progress">
              <div 
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          
          <button
            className="remove-file-btn"
            onClick={onRemoveFile}
            disabled={uploading}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

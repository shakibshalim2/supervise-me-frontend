// src/components/Message.js
import React from 'react';
import { FaDownload, FaImage, FaFile } from 'react-icons/fa';

const Message = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFileMessage = () => {
    if (message.messageType === 'image') {
      return (
        <div className="image-message">
          <img
            src={message.file.url}
            alt={message.file.originalName}
            className="message-image"
            onClick={() => window.open(message.file.url, '_blank')}
          />
          <div className="image-info">
            <span className="image-name">{message.file.originalName}</span>
            <button
              className="download-btn"
              onClick={() => downloadFile(message.file.url, message.file.originalName)}
            >
              <FaDownload />
            </button>
          </div>
        </div>
      );
    }

    if (message.messageType === 'file') {
      return (
        <div className="file-message">
          <div className="file-icon-container">
            <FaFile className="file-icon" />
          </div>
          <div className="file-details">
            <span className="file-name">{message.file.originalName}</span>
            <span className="file-size">{formatFileSize(message.file.size)}</span>
          </div>
          <button
            className="download-btn"
            onClick={() => downloadFile(message.file.url, message.file.originalName)}
          >
            <FaDownload />
          </button>
        </div>
      );
    }
  };

  return (
    <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      <div className="message-content">
        {!isOwnMessage && (
          <div className="sender-name">{message.senderName}</div>
        )}
        
        {message.message && (
          <div className="message-text">{message.message}</div>
        )}
        
        {(message.messageType === 'file' || message.messageType === 'image') && 
          renderFileMessage()
        }
        
        <div className="message-time">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default Message;

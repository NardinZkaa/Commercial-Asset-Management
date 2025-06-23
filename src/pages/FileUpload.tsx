import React, { useRef, useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({ 
  onFileSelect, 
  accept = ".pdf,.doc,.docx", 
  maxSize = 10,
  className = "",
  disabled = false
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setError('');
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.some(type => type === fileExtension || file.type.includes(type.replace('.', '')))) {
      setError('Invalid file type. Please select a PDF or Word document.');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-slate-50 cursor-pointer'}
          ${selectedFile ? 'border-green-400 bg-green-50' : ''}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-800">{selectedFile.name}</p>
              <p className="text-sm text-green-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 text-green-600 hover:text-green-700 rounded-full hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className={`w-12 h-12 mx-auto mb-4 ${error ? 'text-red-400' : 'text-slate-400'}`} />
            <p className={`text-lg font-medium mb-2 ${error ? 'text-red-700' : 'text-slate-700'}`}>
              {error || 'Upload Handover Form'}
            </p>
            <p className="text-sm text-slate-500">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Supports PDF, DOC, DOCX (max {maxSize}MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-600 text-sm mt-2 flex items-center">
          <X className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}
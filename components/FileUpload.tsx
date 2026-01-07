import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { processFiles } from '../services/fileUtils';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFilesAdded: (files: UploadedFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    setIsProcessing(true);
    const processed = await processFiles(droppedFiles);
    onFilesAdded(processed);
    setIsProcessing(false);
  }, [onFilesAdded]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const selectedFiles = Array.from(e.target.files);
      const processed = await processFiles(selectedFiles);
      onFilesAdded(processed);
      setIsProcessing(false);
    }
  }, [onFilesAdded]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center group cursor-pointer
        ${isDragging 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 bg-slate-800/20'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        type="file"
        id="file-input"
        className="hidden"
        multiple
        accept=".txt,.md,.json,.csv,.js,.ts,.py,.html,.css"
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center justify-center gap-3">
        {isProcessing ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        ) : (
          <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'}`}>
            <Upload size={24} />
          </div>
        )}
        
        <div>
          <p className="text-sm font-medium text-slate-200">
            {isProcessing ? 'Processing files...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supported: TXT, MD, JSON, CSV, Code (Max 5MB combined text recommended)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

import React from 'react';
import { FileText, Trash2, Database } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileSidebarProps {
  files: UploadedFile[];
  onRemoveFile: (id: string) => void;
}

const FileSidebar: React.FC<FileSidebarProps> = ({ files, onRemoveFile }) => {
  const totalChars = files.reduce((acc, f) => acc + f.content.length, 0);
  // Rough token estimate (4 chars per token)
  const estimatedTokens = Math.round(totalChars / 4);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-80 flex-shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Database className="text-blue-500" size={24} />
          Knowledge Base
        </h2>
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Context Usage</span>
            <span>{estimatedTokens.toLocaleString()} tokens</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((estimatedTokens / 1000000) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 text-right">
            ~1M Token Limit (Gemini 3 Pro)
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {files.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <p className="text-sm">No files uploaded.</p>
            <p className="text-xs mt-1">Upload documents to start chatting.</p>
          </div>
        ) : (
          files.map((file) => (
            <div 
              key={file.id} 
              className="group flex items-start justify-between p-3 bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-slate-700/50 rounded-md text-blue-400">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {(file.content.length / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(file.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                title="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-xs text-slate-500 text-center">
        Powered by Gemini 3 Pro
      </div>
    </div>
  );
};

export default FileSidebar;

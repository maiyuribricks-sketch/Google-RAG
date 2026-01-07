import React, { useState, useRef, useEffect } from 'react';
import { UploadedFile, Message } from './types';
import FileSidebar from './components/FileSidebar';
import FileUpload from './components/FileUpload';
import MessageBubble from './components/MessageBubble';
import { generateRAGResponse } from './services/gemini';
import { Send, Plus, Menu, X, ArrowUpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am your RAG assistant. Upload your documents, and I will answer questions based on their content.',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile toggle
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFilesAdded = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Add a placeholder "Thinking" message
    const thinkingMessageId = 'thinking-' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingMessageId,
        role: 'model',
        text: '',
        timestamp: Date.now(),
        isThinking: true,
      },
    ]);

    try {
      const contextFiles = files; // Send all files. For a real app, you might filter here.
      
      const historyForApi = messages.map(m => ({ role: m.role, text: m.text }));
      
      const responseText = await generateRAGResponse(
        userMessage.text,
        contextFiles,
        historyForApi
      );

      // Replace thinking message with actual response
      setMessages((prev) => 
        prev.map(m => 
          m.id === thinkingMessageId 
            ? { ...m, text: responseText, isThinking: false } 
            : m
        )
      );

    } catch (error) {
      setMessages((prev) => 
        prev.map(m => 
          m.id === thinkingMessageId 
            ? { ...m, text: "Sorry, I encountered an error processing your request.", isThinking: false } 
            : m
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <FileSidebar files={files} onRemoveFile={handleRemoveFile} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-md text-slate-400"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Gemini RAG Assistant
            </h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Powered by Google GenAI SDK
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-20 text-center opacity-0 animate-fadeIn">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                   <ArrowUpCircle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2">Upload Documents & Ask Away</h3>
                <p className="text-slate-500 max-w-md">
                  Upload PDF text, code files, or notes. Gemini will read them and answer your questions with citations.
                </p>
              </div>
            ) : (
               messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 z-10">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            
            {/* Context/File preview if needed, for now just the uploader in the sidebar, 
                but let's put a mini uploader here if list is empty or for convenience */}
            {files.length === 0 && messages.length < 2 && (
               <FileUpload onFilesAdded={handleFilesAdded} />
            )}

            <div className="relative flex items-end gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
               <button 
                className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                onClick={() => document.getElementById('file-input')?.click()}
                title="Add more files"
               >
                 <Plus size={20} />
               </button>

               <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={files.length === 0 ? "Upload files first to start RAG..." : "Ask a question about your documents..."}
                className="w-full bg-transparent border-none focus:ring-0 resize-none py-2.5 px-2 text-sm text-slate-200 placeholder:text-slate-500 max-h-32 min-h-[44px]"
                rows={1}
                style={{ height: 'auto', minHeight: '44px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
                className={`p-2.5 rounded-lg flex-shrink-0 transition-all duration-200 
                  ${inputValue.trim() && !isProcessing 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
              >
                <Send size={18} />
              </button>
            </div>
            
            <div className="text-center">
               <p className="text-[10px] text-slate-600">
                 Gemini can make mistakes. Verify important information from your documents.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileCode, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Loader2, 
  Terminal,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

export default function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const newFileItems: FileItem[] = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'completed'
    }));

    setFiles(prev => [...prev, ...newFileItems]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startBuild = () => {
    if (files.length === 0) return;
    
    setIsBuilding(true);
    setBuildProgress(0);
    setBuildLogs(["[SYSTEM] Initializing build environment...", "[SYSTEM] Checking dependencies..."]);

    const steps = [
      "Compiling source files...",
      "Optimizing assets...",
      "Running type checks...",
      "Generating build artifacts...",
      "Finalizing deployment package..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBuilding(false);
          setBuildLogs(prevLogs => [...prevLogs, "[SUCCESS] Build completed successfully!"]);
          return 100;
        }
        
        const nextProgress = prev + Math.random() * 15;
        if (nextProgress >= (currentStep + 1) * 20 && currentStep < steps.length) {
          setBuildLogs(prevLogs => [...prevLogs, `[BUILD] ${steps[currentStep]}`]);
          currentStep++;
        }
        
        return Math.min(nextProgress, 100);
      });
    }, 600);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-[#E4E3E0]">
        <div>
          <h1 className="font-serif italic text-2xl tracking-tight">Code Build Hub</h1>
          <p className="text-[11px] uppercase tracking-widest opacity-50 mt-1">v2.4.0 // Production Environment</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 border border-[#141414] rounded-full text-[10px] font-mono">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Files */}
        <div className="lg:col-span-7 space-y-8">
          <section>
            <h2 className="font-serif italic text-lg mb-4">01. Source Upload</h2>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed border-[#141414] rounded-xl p-12
                transition-all duration-300 cursor-pointer group
                ${isDragging ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'}
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="flex flex-col items-center text-center">
                <Upload className={`w-12 h-12 mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:-translate-y-1'}`} />
                <p className="font-mono text-sm mb-2">DRAG & DROP FILES OR CLICK TO BROWSE</p>
                <p className="text-[11px] opacity-50 uppercase tracking-wider">Supports .ts, .tsx, .js, .json, .css</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-serif italic text-lg">02. Staging Area</h2>
              <span className="font-mono text-[10px] opacity-50 uppercase tracking-widest">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
              </span>
            </div>
            
            <div className="border border-[#141414] rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
              <div className="grid grid-cols-[40px_1.5fr_1fr_1fr_40px] p-3 border-b border-[#141414] text-[10px] uppercase font-mono tracking-widest opacity-50">
                <span>#</span>
                <span>Filename</span>
                <span>Size</span>
                <span>Status</span>
                <span />
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {files.length === 0 ? (
                    <div className="p-12 text-center text-[11px] font-mono opacity-30 italic">
                      NO FILES IN STAGING
                    </div>
                  ) : (
                    files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-[40px_1.5fr_1fr_1fr_40px] p-4 border-b border-[#141414]/10 last:border-0 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors group"
                      >
                        <span className="font-mono text-[11px] opacity-50">0{index + 1}</span>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileCode className="w-4 h-4 shrink-0" />
                          <span className="truncate font-mono text-[11px]">{file.name}</span>
                        </div>
                        <span className="font-mono text-[11px] opacity-50">{formatSize(file.size)}</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-[10px] uppercase tracking-wider font-semibold">Ready</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Build Control & Logs */}
        <div className="lg:col-span-5 space-y-8">
          <section>
            <h2 className="font-serif italic text-lg mb-4">03. Build Control</h2>
            <div className="border border-[#141414] rounded-xl p-6 bg-[#141414] text-[#E4E3E0]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest mb-1">Target Build</h3>
                  <p className="text-xl font-serif italic">Production_Release_v1</p>
                </div>
                <Terminal className="w-6 h-6 opacity-50" />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest mb-2">
                    <span>Progress</span>
                    <span>{Math.round(buildProgress)}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${buildProgress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={startBuild}
                  disabled={isBuilding || files.length === 0}
                  className={`
                    w-full py-4 rounded-lg font-mono text-xs uppercase tracking-[0.2em]
                    flex items-center justify-center gap-3 transition-all
                    ${isBuilding || files.length === 0 
                      ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                      : 'bg-white text-[#141414] hover:bg-[#E4E3E0] active:scale-[0.98]'}
                  `}
                >
                  {isBuilding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Building...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Initialize Build
                    </>
                  )}
                </button>
                
                {files.length === 0 && !isBuilding && (
                  <div className="flex items-center gap-2 text-[10px] text-yellow-500 font-mono uppercase tracking-wider">
                    <AlertCircle className="w-3 h-3" />
                    Upload files to enable build
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="flex-1">
            <h2 className="font-serif italic text-lg mb-4">04. Build Logs</h2>
            <div className="border border-[#141414] rounded-xl bg-[#141414] p-4 h-[300px] overflow-y-auto font-mono text-[10px] space-y-1">
              {buildLogs.length === 0 ? (
                <div className="opacity-30 italic">Waiting for process initialization...</div>
              ) : (
                buildLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={log.includes('[SUCCESS]') ? 'text-green-400' : log.includes('[SYSTEM]') ? 'text-blue-400' : 'text-white/70'}
                  >
                    {log}
                  </motion.div>
                ))
              )}
              {isBuilding && (
                <div className="flex items-center gap-2 text-white/50 animate-pulse">
                  <span className="w-1 h-1 bg-white rounded-full" />
                  Processing...
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#141414] p-6 mt-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-mono uppercase tracking-widest opacity-50">
          <span>© 2026 Code Build Hub // System Core</span>
          <div className="flex gap-8">
            <span>Status: Operational</span>
            <span>Region: Asia-Southeast1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

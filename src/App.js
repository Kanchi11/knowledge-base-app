import React, { useState } from 'react';
import { Upload, Search, FileText, AlertCircle, CheckCircle, XCircle, Trash2, ArrowRight, Info, Lightbulb } from 'lucide-react';
import useDocumentStorage from './hooks/useDocumentStorage';

const KnowledgeBaseApp = () => {
  const { documents, isLoading: documentsLoading, addDocument, deleteDocument, clearAllDocuments } = useDocumentStorage();
  
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState([]);
  const [error, setError] = useState(null);
  const [searchStatus, setSearchStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.md'];

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      'txt': 'text/plain',
      'md': 'text/markdown',
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword'
    };
    return types[ext] || 'text/plain';
  };

  const extractText = async (file) => {
    const filename = file.name.toLowerCase();
    
    if (filename.endsWith('.txt') || filename.endsWith('.md')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
    
    if (filename.endsWith('.pdf')) {
      return await extractPdfText(file);
    }
    
    if (filename.endsWith('.docx')) {
      return await extractDocxText(file);
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const extractPdfText = async (file) => {
    try {
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
        
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      const result = fullText.trim();
      
      if (result.length < 50) {
        throw new Error('This PDF appears to be scanned without text. OCR is not supported.');
      }
      
      return result;
    } catch (err) {
      if (err.message.includes('password')) {
        throw new Error('This PDF is password-protected and cannot be processed');
      }
      throw new Error(`PDF extraction failed: ${err.message}`);
    }
  };

  const extractDocxText = async (file) => {
    try {
      if (!window.mammoth) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (err) {
      throw new Error(`DOCX extraction failed: ${err.message}`);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processFiles = async (files) => {
    const validFiles = [];
    
    // Validate all files first
    for (const file of files) {
      // File size check
      if (file.size > MAX_FILE_SIZE) {
        alert(`❌ "${file.name}" is too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
        continue;
      }
      
      // Check if file is empty
      if (file.size === 0) {
        alert(`❌ "${file.name}" appears to be empty.`);
        continue;
      }
      
      // File type check
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        alert(`❌ "${file.name}" is not supported. Please upload PDF, DOCX, TXT, or MD files.`);
        continue;
      }
      
      // Check for duplicate
      const existingDoc = documents.find(doc => doc.name === file.name);
      if (existingDoc) {
        const overwrite = window.confirm(
          `📄 "${file.name}" already exists. Do you want to replace it?`
        );
        if (overwrite) {
          await deleteDocument(existingDoc.id);
        } else {
          continue;
        }
      }
      
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadingDocs(validFiles.map(f => f.name));

    for (const file of validFiles) {
      try {
        const text = await extractText(file);
        
        // Validate extracted text
        if (!text || text.trim().length === 0) {
          alert(`❌ Could not extract text from "${file.name}". The file may be empty or corrupted.`);
          continue;
        }
        
        if (text.trim().length < 10) {
          const proceed = window.confirm(
            `⚠️ "${file.name}" has very little content (${text.length} characters). Upload anyway?`
          );
          if (!proceed) continue;
        }
        
        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type || getFileType(file.name),
          content: text,
          uploadedAt: new Date().toISOString(),
          size: file.size
        };
        
        await addDocument(newDoc);
        
      } catch (err) {
        console.error('Error processing file:', err);
        alert(`❌ Failed to process "${file.name}":\n${err.message}`);
      }
    }
    
    setUploadingDocs([]);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    await processFiles(files);
    e.target.value = '';
  };

  const handleSearch = async () => {
    if (documents.length === 0) {
      return;
    }
    
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      setError('Please enter a question');
      return;
    }
    
    if (trimmedQuery.length < 3) {
      setError('Question too short. Please enter at least 3 characters.');
      return;
    }
    
    if (trimmedQuery.length > 500) {
      setError('Question too long. Please keep it under 500 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnswer(null);
    
    try {
      setSearchStatus('🔍 Searching through your documents...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setSearchStatus(`Analyzing ${documents.length} document${documents.length > 1 ? 's' : ''}...`);
      await new Promise(resolve => setTimeout(resolve, 400));

      setSearchStatus('Finding the best answer for you...');

      const response = await fetch('http://localhost:3002/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: trimmedQuery,
          documents: documents
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      setSearchStatus('⚡ Processing results...');
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await response.json();
      
      setSearchStatus('✅ Done searching the documents!');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setAnswer(result);
      setSearchStatus('');
      
    } catch (err) {
      console.error('Search error:', err);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Cannot connect to server. Please ensure the backend is running on http://localhost:3002');
      } else if (err.message.includes('timeout')) {
        setError('Search timed out. Please try a simpler question.');
      } else {
        setError(err.message || 'An error occurred while searching');
      }
      setSearchStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await deleteDocument(id);
      setAnswer(null);
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all documents? This cannot be undone.')) {
      try {
        await clearAllDocuments();
        setAnswer(null);
      } catch (err) {
        console.error('Error clearing documents:', err);
        alert('Failed to clear documents');
      }
    }
  };

  const getConfidenceConfig = (confidence) => {
    const configs = {
      high: {
        label: 'Complete Answer',
        color: 'emerald',
        icon: CheckCircle,
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
        textClass: 'text-emerald-900',
        iconClass: 'text-emerald-600',
        barClass: 'bg-emerald-500'
      },
      medium: {
        label: 'Partial Answer',
        color: 'amber',
        icon: AlertCircle,
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        textClass: 'text-amber-900',
        iconClass: 'text-amber-600',
        barClass: 'bg-amber-500'
      },
      low: {
        label: 'Limited Information',
        color: 'red',
        icon: Info,
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        textClass: 'text-red-900',
        iconClass: 'text-red-600',
        barClass: 'bg-red-400'
      }
    };
    return configs[confidence] || configs.low;
  };

  const confidenceConfig = answer ? getConfidenceConfig(answer.confidence) : null;
  const ConfidenceIcon = confidenceConfig?.icon;

  if (documentsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Wand AI</h1>
                <p className="text-xs text-slate-500">Knowledge Base</p>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Documents */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
                  <p className="text-sm text-slate-500 mt-1">Upload files to search through</p>
                </div>
                {documents.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Upload Area */}
              <div className="p-6">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl transition-all ${
                    dragActive 
                      ? 'border-slate-400 bg-slate-50' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept=".txt,.md,.pdf,.docx,.doc"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="p-8 text-center">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Drop files here or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, DOCX, TXT, MD • Max 10MB per file
                    </p>
                  </div>
                </div>

                {uploadingDocs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadingDocs.map((name, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></div>
                        <span className="truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document List */}
              <div className="border-t border-slate-100">
                {documents.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-slate-500">No documents yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {documents.map(doc => (
                      <div key={doc.id} className="p-4 hover:bg-slate-50 transition group">
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate" title={doc.name}>{doc.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatFileSize(doc.size || 0)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-slate-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Search & Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Search Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearch()}
                    placeholder="Ask a question about your documents..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition"
                    disabled={documents.length === 0 || loading}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || documents.length === 0 || loading}
                  className="px-6 py-3.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-red-800 disabled:bg-red-300 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching
                    </>
                  ) : (
                    <>
                      Search
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Feedback */}
            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 mb-2">{searchStatus}</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-slate-900 animate-pulse" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {documents.length === 0 && !loading && !answer && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents uploaded</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Upload documents to your knowledge base to start asking questions and getting instant answers
                </p>
              </div>
            )}

            {/* Results */}
            {answer && !loading && (
              <div className="space-y-6">
                
                {/* Confidence Card */}
                <div className={`rounded-xl border ${confidenceConfig.borderClass} ${confidenceConfig.bgClass} overflow-hidden`}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg ${confidenceConfig.bgClass} border ${confidenceConfig.borderClass} flex items-center justify-center`}>
                        <ConfidenceIcon className={`w-5 h-5 ${confidenceConfig.iconClass}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${confidenceConfig.textClass}`}>{confidenceConfig.label}</p>
                        <p className="text-sm text-slate-600">{answer.coverage}% of your question answered</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${confidenceConfig.barClass} transition-all duration-700`}
                        style={{ width: `${answer.coverage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Answer Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">💡</span>
                    </div>
                    <h3 className="font-semibold text-slate-900">Answer</h3>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{answer.answer}</p>
                  </div>
                </div>

                {/* Sources */}
                {answer.sources && answer.sources.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Sources</h3>
                      <span className="text-sm text-slate-500">{answer.sources.length} {answer.sources.length === 1 ? 'document' : 'documents'}</span>
                    </div>
                    <div className="space-y-3">
                      {answer.sources.map((source, idx) => {
                        const relevanceColors = {
                          high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                          medium: 'bg-amber-100 text-amber-700 border-amber-200',
                          low: 'bg-slate-100 text-slate-700 border-slate-200'
                        };
                        return (
                          <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span className="font-medium text-slate-900 text-sm">{source.docName}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded border font-medium ${relevanceColors[source.relevance] || relevanceColors.medium}`}>
                                {source.relevance}
                              </span>
                            </div>
                            {source.excerpt && (
                              <p className="text-sm text-slate-600 italic pl-6">
                                "{source.excerpt}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {answer.suggestions && answer.suggestions.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white rounded-lg border border-amber-200 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900">Next Steps</h3>
                        <p className="text-sm text-amber-700">Here's what you can do to get a complete answer</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {answer.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
                          <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-semibold">
                              {idx + 1}
                            </span>
                            <p className="text-sm text-slate-700 leading-relaxed">{suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseApp;
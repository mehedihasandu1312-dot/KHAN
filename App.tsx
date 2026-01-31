import React, { useState, useEffect, useCallback, useRef } from 'react';
import { lookupWord } from './services/geminiService';
import { DictionaryEntry, SearchStatus, HistoryItem } from './types';
import WordDisplay from './components/WordDisplay';
import { 
  Search, 
  Mic, 
  BookOpen, 
  History as HistoryIcon, 
  Star, 
  Loader2,
  X,
  Menu
} from './components/Icons';

function App() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [data, setData] = useState<DictionaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Persistence States
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

  // Initialization
  useEffect(() => {
    const savedHistory = localStorage.getItem('borno_history');
    const savedFavorites = localStorage.getItem('borno_favorites');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  useEffect(() => {
    localStorage.setItem('borno_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('borno_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setQuery(searchTerm);
    setStatus('loading');
    setError(null);
    setData(null);

    try {
      const result = await lookupWord(searchTerm);
      setData(result);
      setStatus('success');
      
      // Update history
      setHistory(prev => {
        const filtered = prev.filter(item => item.word.toLowerCase() !== searchTerm.toLowerCase());
        return [{ word: result.word, timestamp: Date.now() }, ...filtered].slice(0, 50);
      });
    } catch (err) {
      console.error(err);
      setError("Could not find definition. Please try again.");
      setStatus('error');
    }
  }, []);

  const handleToggleFavorite = (word: string) => {
    setFavorites(prev => {
      if (prev.includes(word)) return prev.filter(w => w !== word);
      return [word, ...prev];
    });
  };

  const handleSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a Bengali voice if available/appropriate, otherwise generic
    const voices = window.speechSynthesis.getVoices();
    // Ideally we would select a voice here, but browser support varies wildly.
    // Default usually works for English words. For Bengali, it might be limited.
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD'; // Default to Bengali, or could be 'en-US'
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };
    } else {
      alert("Voice input not supported in this browser.");
    }
  };

  // Sidebar Component (Internal for simple access to state)
  const Sidebar = () => (
    <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-5 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 font-bengali">Menu</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'history' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'favorites' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('favorites')}
          >
            Saved
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {activeTab === 'history' ? (
            history.length === 0 ? (
              <p className="text-center text-slate-400 mt-10 text-sm">No recent searches</p>
            ) : (
              history.map((item, i) => (
                <button 
                  key={i}
                  onClick={() => { handleSearch(item.word); setSidebarOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 group transition-all"
                >
                  <p className="font-medium text-slate-700 font-bengali">{item.word}</p>
                  <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                </button>
              ))
            )
          ) : (
             favorites.length === 0 ? (
              <p className="text-center text-slate-400 mt-10 text-sm">No saved words</p>
            ) : (
              favorites.map((word, i) => (
                <button 
                  key={i}
                  onClick={() => { handleSearch(word); setSidebarOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-xl bg-yellow-50/50 hover:bg-yellow-50 border border-yellow-100/50 hover:border-yellow-200 group transition-all flex justify-between items-center"
                >
                  <span className="font-medium text-slate-800 font-bengali">{word}</span>
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                </button>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <Sidebar />
      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Layout */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Top Navigation / Search Area */}
        <div className={`transition-all duration-500 ease-in-out ${status === 'success' ? 'flex-shrink-0 pt-6 pb-2 bg-white border-b border-slate-200' : 'flex-1 flex flex-col justify-center items-center bg-gradient-to-b from-slate-50 to-slate-100'}`}>
          
          <div className={`w-full max-w-2xl px-4 ${status !== 'success' && '-mt-20'}`}>
            {/* Logo/Title when idle */}
            <div className={`text-center mb-8 transition-opacity duration-300 ${status === 'success' ? 'hidden' : 'opacity-100'}`}>
              <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-2xl mb-4">
                <BookOpen className="text-primary-600" size={32} />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 font-bengali mb-2">শব্দকোষ <span className="text-primary-600">Borno</span></h1>
              <p className="text-slate-500">AI Powered Bilingual Dictionary</p>
            </div>

            {/* Search Bar */}
            <div className="relative group z-10">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-24 py-4 rounded-2xl border-2 border-slate-200 bg-white text-lg placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all shadow-sm font-bengali"
                placeholder="Search English or Bengali word..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                  >
                    <X size={18} />
                  </button>
                )}
                <button 
                  onClick={startVoiceInput}
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                  title="Voice Search"
                >
                  <Mic size={20} />
                </button>
                <button 
                  onClick={() => handleSearch(query)}
                  disabled={!query.trim() || status === 'loading'}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {status === 'loading' ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                </button>
              </div>
            </div>

            {/* Quick Suggestions (Idle Only) */}
            {status === 'idle' && (
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {['Serendipity', 'অদম্য', 'Resilience', 'সূর্যমুখী'].map(w => (
                  <button 
                    key={w}
                    onClick={() => handleSearch(w)}
                    className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm hover:border-primary-300 hover:text-primary-600 transition-all font-bengali shadow-sm"
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}
          </div>

           {/* Mobile Menu Toggle (Only when searching or successful) */}
           <button 
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white text-slate-600 border border-slate-200 shadow-sm"
            >
              <Menu size={20} />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth">
          <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="w-full max-w-xl space-y-2 mt-8">
                  <div className="h-32 bg-slate-200 rounded-3xl"></div>
                  <div className="h-12 bg-slate-200 rounded-xl"></div>
                </div>
                <p className="text-slate-400 text-sm mt-4">Generating definition with AI...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center p-4 bg-red-50 rounded-full mb-4">
                  <X className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Oops!</h3>
                <p className="text-slate-500">{error}</p>
              </div>
            )}

            {status === 'success' && data && (
              <WordDisplay 
                data={data} 
                onSpeak={handleSpeech}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(data.word)}
              />
            )}
            
            {/* Empty state for 'success' but no data - strictly shouldn't happen with correct logic */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
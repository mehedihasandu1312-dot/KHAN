import React, { useState, useEffect, useCallback } from 'react';
import { DictionaryEntry, SearchStatus, HistoryItem } from './types';
import WordDisplay from './components/WordDisplay';
import AdminPanel from './components/AdminPanel';
import { searchLocalWords } from './services/store';
import { 
  Search, 
  Mic, 
  BookOpen, 
  History as HistoryIcon, 
  Star, 
  X,
  Menu,
  ChevronRight,
  UserCog
} from './components/Icons';

function App() {
  const [query, setQuery] = useState('');
  // view mode: 'home' (search list) | 'details' (full view)
  const [view, setView] = useState<'home' | 'details'>('home');
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry | null>(null);
  
  // Data for the search results list
  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Persistence States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'favorites'>('favorites');

  // Load favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem('borno_favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    // Initial load of all words
    setSearchResults(searchLocalWords(''));
  }, []);

  useEffect(() => {
    localStorage.setItem('borno_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Real-time search
  useEffect(() => {
    const results = searchLocalWords(query);
    setSearchResults(results);
    // If we were in details view and start typing, go back to list
    if (query && view === 'details') {
      setView('home');
    }
  }, [query]);

  const handleSelectWord = (entry: DictionaryEntry) => {
    setSelectedWord(entry);
    setView('details');
    setQuery(''); // Optional: clear query or keep it? Let's clear to show the word cleanly.
  };

  const handleToggleFavorite = (word: string) => {
    setFavorites(prev => {
      if (prev.includes(word)) return prev.filter(w => w !== word);
      return [word, ...prev];
    });
  };

  const handleSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };
    } else {
      alert("Voice input not supported in this browser.");
    }
  };

  const closeDetails = () => {
    setView('home');
    setSearchResults(searchLocalWords('')); // Reset list
  };

  // Sidebar Component
  const Sidebar = () => (
    <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-5 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 font-bengali">Menu</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <button 
          onClick={() => { setIsAdminOpen(true); setSidebarOpen(false); }}
          className="flex items-center gap-3 w-full p-3 mb-4 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
        >
          <UserCog size={20} />
          <div className="text-left">
            <p className="font-bold text-sm">Admin Dashboard</p>
            <p className="text-xs text-slate-400">Manage dictionary words</p>
          </div>
        </button>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Saved Words</h3>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {favorites.length === 0 ? (
            <p className="text-center text-slate-400 mt-10 text-sm">No saved words</p>
          ) : (
            favorites.map((word, i) => (
              <button 
                key={i}
                onClick={() => { 
                  // Find the full entry for the favorite word
                  const results = searchLocalWords(word);
                  const entry = results.find(w => w.word === word);
                  if (entry) handleSelectWord(entry);
                  setSidebarOpen(false); 
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-yellow-50/50 hover:bg-yellow-50 border border-yellow-100/50 hover:border-yellow-200 group transition-all flex justify-between items-center"
              >
                <span className="font-medium text-slate-800 font-bengali">{word}</span>
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {isAdminOpen && <AdminPanel onClose={() => { setIsAdminOpen(false); setSearchResults(searchLocalWords(query)); }} />}
      
      <Sidebar />
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={closeDetails}>
            <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
              <BookOpen size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 font-bengali hidden sm:block">শব্দকোষ <span className="text-primary-600">Borno</span></h1>
          </div>
          
          <div className="flex-1 max-w-lg relative">
            <input 
              type="text"
              placeholder="Search dictionary..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-slate-100 focus:bg-white border border-transparent focus:border-primary-300 outline-none transition-all font-bengali"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => { if(view === 'details') setView('home'); }}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            {query ? (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            ) : (
              <button onClick={startVoiceInput} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600">
                <Mic size={18} />
              </button>
            )}
          </div>

          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          
          {/* SEARCH LIST VIEW */}
          {view === 'home' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {searchResults.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-lg">No words found</p>
                  <p className="text-sm">Try searching for something else or add words in Admin.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-end mb-4 px-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {query ? 'Search Results' : 'Recent Words'} ({searchResults.length})
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {searchResults.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => handleSelectWord(entry)}
                        className="group relative bg-white overflow-hidden rounded-2xl border border-slate-200 p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 text-left flex flex-col h-full"
                      >
                         {/* Decorative gradient blob */}
                         <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500" />

                        <div className="relative z-10 flex-1">
                          <div className="flex justify-between items-start mb-2 pr-4">
                            <h3 className="text-2xl font-bold text-slate-800 font-bengali group-hover:text-primary-700 transition-colors">
                              {entry.word}
                            </h3>
                          </div>
                          
                          {entry.partOfSpeech && (
                             <span className="inline-block px-2 py-0.5 mb-3 text-xs font-semibold tracking-wide text-primary-700 bg-primary-50 rounded-md border border-primary-100">
                              {entry.partOfSpeech}
                            </span>
                          )}

                          <p className="text-slate-600 font-bengali text-lg leading-relaxed line-clamp-2 mb-4">
                            {entry.meaning}
                          </p>
                        </div>
                        
                        <div className="relative z-10 pt-4 border-t border-slate-50 flex justify-between items-center w-full mt-auto">
                           <span className="text-xs text-slate-400 font-medium group-hover:text-primary-500 transition-colors flex items-center gap-1">
                              View Details
                           </span>
                           <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                              <ChevronRight size={16} />
                           </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* DETAILS VIEW */}
          {view === 'details' && selectedWord && (
            <div>
              <button 
                onClick={closeDetails}
                className="mb-4 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 flex items-center gap-2 transition-all w-fit"
              >
                <ChevronRight className="rotate-180" size={16} /> Back to list
              </button>
              <WordDisplay 
                data={selectedWord}
                onSpeak={handleSpeech}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(selectedWord.word)}
              />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
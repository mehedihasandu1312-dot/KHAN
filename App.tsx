import React, { useState, useEffect } from 'react';
import { DictionaryEntry } from './types';
import WordDisplay from './components/WordDisplay';
import AdminPanel from './components/AdminPanel';
import { searchLocalWords, getWords, getHistory, addToHistory, clearHistory } from './services/store';
import { 
  Search, 
  Mic, 
  BookOpen, 
  Star, 
  X,
  Menu,
  UserCog,
  Bell,
  Home,
  Users,
  FileText,
  User,
  ChevronRight,
  History,
  Loader2
} from './components/Icons';

function App() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'home' | 'details' | 'search'>('home');
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry | null>(null);
  
  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  
  const [historyItems, setHistoryItems] = useState<DictionaryEntry[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Load favorites & history
  useEffect(() => {
    const savedFavorites = localStorage.getItem('borno_favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    refreshHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem('borno_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const refreshHistory = () => {
    setHistoryItems(getHistory());
  };

  // Real-time search
  useEffect(() => {
    if (query.trim() === '') {
      if (view === 'search') setView('home');
      setSearchResults([]);
    } else {
      if (view === 'home' || view === 'details') setView('search');
      const results = searchLocalWords(query);
      setSearchResults(results);
    }
  }, [query]);

  const handleSelectWord = (entry: DictionaryEntry) => {
    setSelectedWord(entry);
    addToHistory(entry);
    refreshHistory();
    setView('details');
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

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'bn-BD'; // Bengali Bangladesh
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };
      
      recognition.start();
    } else {
      alert("আপনার ব্রাউজারে ভয়েস সার্চ সমর্থিত নয়। দয়া করে Google Chrome ব্যবহার করুন।");
    }
  };

  const closeDetails = () => {
    setView('home');
    setQuery('');
  };

  const clearAppHistory = () => {
    clearHistory();
    refreshHistory();
  };

  // Student Study Topics
  const topics = [
    { id: 'grammar', label: 'ব্যাকরণ', subtitle: 'সমাস, সন্ধি ও কারক', icon: '📚', search: 'সমাস' }, 
    { id: 'science', label: 'বিজ্ঞান', subtitle: 'পারিভাষিক শব্দাবলী', icon: '🧬', search: 'কোষ' },
    { id: 'literature', label: 'সাহিত্য', subtitle: 'অলঙ্কার ও ছন্দ', icon: '✒️', search: 'অলঙ্কার' },
    { id: 'idioms', label: 'বাগধারা', subtitle: 'প্রবাদ ও প্রবচন', icon: '💬', search: 'বাগধারা' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      {isAdminOpen && <AdminPanel onClose={() => { setIsAdminOpen(false); }} />}
      
      {/* Sidebar (Drawer) */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 h-full flex flex-col bg-slate-50">
          <div className="flex justify-between items-center mb-8 border-b pb-4 border-slate-200">
            <h2 className="text-2xl font-bold text-teal-700 font-bengali">মেনু</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
              <X size={20} />
            </button>
          </div>

          <button 
            onClick={() => { setIsAdminOpen(true); setSidebarOpen(false); }}
            className="flex items-center gap-4 w-full p-4 mb-4 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-700 hover:bg-teal-50 hover:border-teal-200 transition-all"
          >
            <div className="bg-teal-100 p-2 rounded-lg text-teal-700">
              <UserCog size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-base">অ্যাডমিন প্যানেল</p>
              <p className="text-xs text-slate-500">শিক্ষক/অ্যাডমিন প্রবেশ</p>
            </div>
          </button>
          
          <div className="mt-auto">
             <p className="text-xs text-slate-400 text-center">Version 2.2 Student Edition</p>
          </div>
        </div>
      </div>
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Modern Header */}
      <div className="bg-white sticky top-0 z-30 px-5 py-4 flex items-center justify-between shadow-sm/50 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu size={26} strokeWidth={2} />
          </button>
          <div className="flex flex-col">
             <h1 className="text-xl font-extrabold font-bengali text-slate-800 leading-none">বর্ণ</h1>
             <span className="text-[10px] text-teal-600 font-bold tracking-widest uppercase">Student Dictionary</span>
          </div>
        </div>

        <button className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Prominent Search Bar - Hidden in details view */}
      {view !== 'details' && (
        <div className="px-5 pb-2 pt-2 bg-white sticky top-[70px] z-20 shadow-sm border-b border-slate-50">
          <div className={`relative group transition-all transform ${isListening ? 'scale-105' : ''}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <Search className="text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
            </div>
            <input 
              type="text"
              placeholder={isListening ? "শুনছি..." : "কোন শব্দটি জানতে চান?"}
              className={`w-full pl-11 pr-12 py-4 rounded-2xl bg-slate-100 focus:bg-white border-2 outline-none transition-all font-bengali text-lg placeholder:text-slate-400 shadow-inner ${isListening ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-teal-500 shadow-teal-100/50'}`}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            
            <button 
              onClick={handleVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-sm'}`}
            >
              {isListening ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-32 bg-slate-50">
        {/* HOME VIEW */}
        {view === 'home' && (
          <div className="flex flex-col px-5 pt-6 pb-20 space-y-8 animate-in fade-in duration-500">
            
            {/* Quick Study Topics */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
                স্টাডি কর্নার
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 {topics.map(topic => (
                   <button 
                     key={topic.id}
                     onClick={() => setQuery(topic.search)} 
                     className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-teal-200 hover:shadow-teal-100/50 transition-all flex flex-col items-start gap-3 group text-left"
                   >
                     <span className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">{topic.icon}</span>
                     <div>
                       <h4 className="font-bold text-slate-800 font-bengali text-lg leading-tight">{topic.label}</h4>
                       <p className="text-[10px] text-slate-400 mt-1 font-medium">{topic.subtitle}</p>
                     </div>
                   </button>
                 ))}
              </div>
            </section>

             {/* Recent History */}
             <section>
              <div className="flex justify-between items-center mb-3 px-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    সাম্প্রতিক পাঠ
                  </h3>
                  {historyItems.length > 0 && (
                    <button onClick={clearAppHistory} className="text-xs font-bold text-teal-600 hover:underline">মুছে ফেলুন</button>
                  )}
                </div>
                
                {historyItems.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center border-dashed">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <History size={20} />
                    </div>
                    <p className="text-slate-400 text-sm font-bengali">আপনি এখনো কোনো শব্দ খোঁজেননি</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {historyItems.map((item, idx) => (
                      <button 
                        key={`${item.id}-${idx}`}
                        onClick={() => handleSelectWord(item)}
                        className="w-full flex items-center justify-between p-4 border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors text-left group"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                                {item.word.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 font-bengali text-lg">{item.word}</p>
                                <p className="text-xs text-slate-500 font-sans">{item.translation}</p>
                            </div>
                         </div>
                         <div className="p-2 rounded-full bg-slate-50 text-slate-300 group-hover:bg-teal-600 group-hover:text-white transition-all">
                             <ChevronRight size={16} />
                         </div>
                      </button>
                    ))}
                  </div>
                )}
             </section>

          </div>
        )}

        {/* SEARCH RESULTS VIEW */}
        {view === 'search' && (
          <div className="px-5 py-6 min-h-full bg-slate-50">
            <div className="flex justify-between items-end mb-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">অনুসন্ধানের ফলাফল</p>
              <span className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600 font-bold">{searchResults.length} টি শব্দ</span>
            </div>
            
            <div className="space-y-3">
              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Search size={32} className="opacity-40" />
                  </div>
                  <p className="font-bengali text-lg text-slate-500">দুঃখিত, কোনো শব্দ পাওয়া যায়নি</p>
                  <p className="text-xs mt-2 text-slate-400">বানান চেক করুন বা নতুন শব্দ খুঁজুন</p>
                </div>
              ) : (
                searchResults.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleSelectWord(entry)}
                    className="w-full bg-white p-5 rounded-2xl border border-slate-100 hover:border-teal-500 hover:shadow-md text-left group transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 font-bengali group-hover:text-teal-700 transition-colors">{entry.word}</h3>
                        <p className="text-slate-500 font-bengali text-sm mt-1 line-clamp-1">{entry.meaning}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">
                        {entry.partOfSpeech.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* DETAILS VIEW */}
        {view === 'details' && selectedWord && (
          <div className="animate-in slide-in-from-right duration-300 bg-white min-h-full relative z-30">
             <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-40 shadow-sm">
                <button 
                  onClick={closeDetails}
                  className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                >
                  <ChevronRight size={24} className="rotate-180"/>
                </button>
                <span className="font-bengali font-bold text-xl text-slate-800 line-clamp-1">{selectedWord.word}</span>
             </div>
             <WordDisplay 
              data={selectedWord}
              onSpeak={handleSpeech}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.includes(selectedWord.word)}
            />
          </div>
        )}
      </main>

      {/* Modern Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-2 z-40 pb-5 pt-3 px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        
        <button 
          onClick={() => { setActiveNav('home'); closeDetails(); }}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeNav === 'home' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Home size={22} strokeWidth={activeNav === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-bold font-bengali">হোম</span>
        </button>

        <button 
          onClick={() => setActiveNav('class')}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeNav === 'class' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <BookOpen size={22} strokeWidth={activeNav === 'class' ? 2.5 : 2} />
          <span className="text-[10px] font-bold font-bengali">পাঠ</span>
        </button>

         {/* Center Search Trigger (Optional visual improvement) */}
         <div className="w-px h-8 bg-slate-200 mx-2"></div>

        <button 
          onClick={() => setActiveNav('proofreading')}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeNav === 'proofreading' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
           <FileText size={22} strokeWidth={activeNav === 'proofreading' ? 2.5 : 2} />
          <span className="text-[10px] font-bold font-bengali">যাচাই</span>
        </button>

        <button 
          onClick={() => setActiveNav('profile')}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeNav === 'profile' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <User size={22} strokeWidth={activeNav === 'profile' ? 2.5 : 2} />
          <span className="text-[10px] font-bold font-bengali">প্রোফাইল</span>
        </button>

      </div>
    </div>
  );
}

export default App;
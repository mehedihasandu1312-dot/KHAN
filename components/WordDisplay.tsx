import React from 'react';
import { DictionaryEntry } from '../types';
import { Volume2, Star, Share2, Copy, BookOpen, GitBranch, Split, Feather, MoveRight } from 'lucide-react';

interface WordDisplayProps {
  data: DictionaryEntry;
  onSpeak: (text: string) => void;
  onToggleFavorite: (word: string) => void;
  isFavorite: boolean;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ data, onSpeak, onToggleFavorite, isFavorite }) => {
  
  // Helper to copy text
  const handleCopy = () => {
    navigator.clipboard.writeText(`${data.word} - ${data.meaning}`);
    // Optional: Show toast
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-32">
      
      {/* 1. HERO SECTION: Word, Pronunciation, Audio */}
      <div className="bg-white rounded-b-[2rem] shadow-sm border-b border-slate-100 px-6 pt-6 pb-8 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider">
              <BookOpen size={12} />
              {data.partOfSpeech}
            </span>
            <div className="flex gap-2">
               <button 
                onClick={handleCopy}
                className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
              >
                <Copy size={18} />
              </button>
              <button 
                onClick={() => onToggleFavorite(data.word)}
                className={`p-2.5 rounded-full transition-all border ${isFavorite ? 'bg-orange-50 border-orange-100 text-orange-500' : 'bg-slate-50 border-slate-50 text-slate-300 hover:text-orange-400'}`}
              >
                <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-slate-900 font-bengali mb-2 tracking-tight leading-tight">
            {data.word}
          </h1>

          <div className="flex items-center gap-4 text-slate-500 mb-6">
            {data.phonetic && (
              <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">
                {data.phonetic}
              </span>
            )}
            <span className="text-lg font-bengali opacity-80">
              {data.pronunciationBn && `[ ${data.pronunciationBn} ]`}
            </span>
            <button 
              onClick={() => onSpeak(data.word)}
              className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 shadow-md shadow-teal-200 transition-all active:scale-95"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* Core Meaning & Translation Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
             <div className="mb-3">
               <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">অর্থ / Meaning</h3>
               <p className="text-xl font-medium text-slate-800 font-bengali leading-relaxed">
                 {data.meaning}
               </p>
             </div>
             <div className="pt-3 border-t border-slate-200">
               <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">অনুবাদ / Translation</h3>
               <p className="text-lg font-medium text-slate-700 font-sans">
                 {data.translation}
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="px-5 py-6 space-y-6">

        {/* Detailed Description (if different from meaning) */}
        {data.description && data.description !== data.meaning && (
          <div className="prose prose-slate max-w-none">
             <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
               <Feather size={16} className="text-teal-600" /> বিস্তারিত বিবরণ
             </h3>
             <p className="text-slate-600 font-bengali text-lg leading-7 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
               {data.description}
             </p>
          </div>
        )}

        {/* Grammar & Etymology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Grammar Box - Conditional Render based on content */}
          {(data.sandhi || data.samas) && (
            <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
               <h3 className="relative z-10 flex items-center gap-2 text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4">
                 <Split size={16} className="text-indigo-600" /> ব্যাকরণ পাঠ
               </h3>
               
               <div className="relative z-10 space-y-4">
                 {data.sandhi && (
                   <div>
                     <span className="text-xs font-bold text-slate-400 block mb-1">সন্ধি বিচ্ছেদ</span>
                     <p className="text-lg font-bengali font-medium text-slate-800 bg-indigo-50/50 p-2 rounded-lg border border-indigo-50 inline-block">
                       {data.sandhi}
                     </p>
                   </div>
                 )}
                 {data.samas && (
                   <div>
                     <span className="text-xs font-bold text-slate-400 block mb-1">সমাস</span>
                     <p className="text-lg font-bengali text-slate-700">
                       {data.samas}
                     </p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* Etymology Box */}
          {(data.source || data.etymology || data.sourceWord) && (
             <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                <h3 className="relative z-10 flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider mb-4">
                  <GitBranch size={16} className="text-amber-600" /> শব্দ উৎস (Origin)
                </h3>

                <div className="relative z-10 space-y-3">
                   {data.source && (
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span className="text-slate-500 text-sm">উৎস/শ্রেণি:</span>
                        <span className="font-bold text-slate-800 font-bengali">{data.source}</span>
                     </div>
                   )}
                   {data.sourceWord && (
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span className="text-slate-500 text-sm">মূল শব্দ:</span>
                        <span className="font-bold text-slate-800 font-bengali">{data.sourceWord}</span>
                     </div>
                   )}
                   {data.etymology && (
                     <div className="mt-2 pt-2 border-t border-amber-50">
                        <p className="text-slate-600 font-bengali italic">
                          "{data.etymology}"
                        </p>
                     </div>
                   )}
                </div>
             </div>
          )}
        </div>

        {/* Examples Section */}
        {data.examples?.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 px-1">
               ব্যবহারিক উদাহরণ
            </h3>
            <div className="space-y-3">
              {data.examples.map((ex, i) => (
                <div key={i} className="flex gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-200 transition-colors">
                  <div className="min-w-[4px] bg-teal-500 rounded-full"></div>
                  <p className="text-slate-700 font-bengali text-lg leading-relaxed">
                    {ex}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synonyms & Antonyms */}
        {(data.synonyms?.length > 0 || data.antonyms?.length > 0) && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
             {data.synonyms?.length > 0 && (
               <div>
                 <h4 className="text-xs font-bold text-teal-600 uppercase mb-3 flex items-center gap-2">
                   <MoveRight size={14} /> সমার্থক শব্দ (Synonyms)
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {data.synonyms.map((s, i) => (
                     <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-800 rounded-lg text-base font-bengali border border-teal-100">
                       {s}
                     </span>
                   ))}
                 </div>
               </div>
             )}
             
             {data.synonyms?.length > 0 && data.antonyms?.length > 0 && (
               <div className="border-t border-slate-100"></div>
             )}

             {data.antonyms?.length > 0 && (
               <div>
                 <h4 className="text-xs font-bold text-rose-500 uppercase mb-3 flex items-center gap-2">
                   <MoveRight size={14} /> বিপরীত শব্দ (Antonyms)
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {data.antonyms.map((s, i) => (
                     <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-800 rounded-lg text-base font-bengali border border-rose-100">
                       {s}
                     </span>
                   ))}
                 </div>
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};

export default WordDisplay;
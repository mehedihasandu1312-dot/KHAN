import React from 'react';
import { DictionaryEntry } from '../types';
import { Volume2, Star } from './Icons';

interface WordDisplayProps {
  data: DictionaryEntry;
  onSpeak: (text: string) => void;
  onToggleFavorite: (word: string) => void;
  isFavorite: boolean;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ data, onSpeak, onToggleFavorite, isFavorite }) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary-50 to-white p-8 border-b border-primary-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-bengali tracking-wide">
                {data.word}
              </h1>
              <span className="text-lg text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full">
                {data.phonetic}
              </span>
            </div>
            <p className="mt-2 text-primary-700 font-medium italic font-bengali text-lg">
              {data.partOfSpeech}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onSpeak(data.word)}
              className="p-3 rounded-full bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors shadow-sm border border-slate-200"
              title="Listen"
            >
              <Volume2 size={20} />
            </button>
            <button 
              onClick={() => onToggleFavorite(data.word)}
              className={`p-3 rounded-full transition-all shadow-sm border ${
                isFavorite 
                  ? 'bg-yellow-50 text-yellow-500 border-yellow-200' 
                  : 'bg-white text-slate-400 hover:text-yellow-500 border-slate-200'
              }`}
              title="Save to Favorites"
            >
              <Star size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-2xl text-slate-800 font-bengali leading-relaxed">
            {data.meaning}
          </p>
          {data.description && data.description !== data.meaning && (
             <p className="mt-2 text-slate-600 font-bengali text-lg leading-relaxed opacity-90">
             {data.description}
           </p>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="p-8 space-y-8">
        
        {/* Examples */}
        {data.examples.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Examples / উদাহরণ</h3>
            <ul className="space-y-3">
              {data.examples.map((ex, idx) => (
                <li key={idx} className="flex gap-3 items-start group">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0 group-hover:scale-125 transition-transform" />
                  <span className="text-slate-700 font-bengali text-lg leading-relaxed">{ex}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Synonyms */}
          {data.synonyms.length > 0 && (
            <section className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Synonyms / সমার্থক</h3>
              <div className="flex flex-wrap gap-2">
                {data.synonyms.map((syn, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-bengali hover:border-primary-300 transition-colors cursor-default">
                    {syn}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Antonyms */}
          {data.antonyms.length > 0 && (
            <section className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Antonyms / বিপরীতার্থক</h3>
              <div className="flex flex-wrap gap-2">
                {data.antonyms.map((ant, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-bengali hover:border-red-200 transition-colors cursor-default">
                    {ant}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {data.origin && (
          <section className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Origin</h3>
            <p className="text-slate-500 italic text-sm">{data.origin}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default WordDisplay;
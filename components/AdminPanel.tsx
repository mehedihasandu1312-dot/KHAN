import React, { useState, useEffect } from 'react';
import { DictionaryEntry } from '../types';
import { getWords, saveWord, deleteWord } from '../services/store';
import { generateEntryData } from '../services/geminiService';
import { Loader2, Plus, Save, Trash2, Wand2, X, Edit2, Search } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

const emptyEntry: DictionaryEntry = {
  id: '',
  word: '',
  translation: '',
  phonetic: '',
  pronunciationBn: '',
  partOfSpeech: '',
  meaning: '',
  description: '',
  synonyms: [],
  antonyms: [],
  examples: [],
  origin: '',
  etymology: '',
  sandhi: '',
  samas: '',
  source: '',
  sourceWord: ''
};

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [words, setWords] = useState<DictionaryEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    setWords(getWords());
  };

  const handleEdit = (entry: DictionaryEntry) => {
    setEditingEntry({ ...entry });
  };

  const handleCreateNew = () => {
    setEditingEntry({ ...emptyEntry, id: Date.now().toString() });
  };

  const handleSave = () => {
    if (editingEntry && editingEntry.word) {
      saveWord(editingEntry);
      setEditingEntry(null);
      refreshList();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this word?')) {
      deleteWord(id);
      refreshList();
    }
  };

  const handleAiGenerate = async () => {
    if (!editingEntry?.word) {
      alert("Please enter a word first.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await generateEntryData(editingEntry.word);
      setEditingEntry(prev => prev ? { ...prev, ...data } : null);
    } catch (e) {
      alert("AI Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWords = words.filter(w => w.word.toLowerCase().includes(searchTerm.toLowerCase()));

  // Editor View
  if (editingEntry) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto flex flex-col">
        {/* Editor Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-xl font-bold text-slate-800 font-bengali">
            {editingEntry.word ? `Editing: ${editingEntry.word}` : 'New Entry'}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setEditingEntry(null)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!editingEntry.word}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium disabled:opacity-50"
            >
              <Save size={18} /> Save Word
            </button>
          </div>
        </div>

        {/* Editor Form */}
        <div className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-8">
          
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Main Word (Bengali or English)</label>
              <input 
                type="text" 
                value={editingEntry.word}
                onChange={e => setEditingEntry({...editingEntry, word: e.target.value})}
                className="w-full p-3 border-2 border-slate-200 rounded-xl text-2xl font-bold focus:border-primary-500 focus:outline-none"
                placeholder="Enter word here (e.g. সূর্য or Apple)..."
              />
            </div>
            <button 
              onClick={handleAiGenerate}
              disabled={isLoading || !editingEntry.word}
              className="mb-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Wand2 size={20} />}
              Auto-Fill
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Translation / অনুবাদ</label>
              <input 
                value={editingEntry.translation}
                onChange={e => setEditingEntry({...editingEntry, translation: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 font-bold"
                placeholder="English equivalent or Bengali Meaning"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Part of Speech (পদ)</label>
              <input 
                value={editingEntry.partOfSpeech}
                onChange={e => setEditingEntry({...editingEntry, partOfSpeech: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 font-bengali"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Pronunciation (বাংলা উচ্চারণ)</label>
              <input 
                value={editingEntry.pronunciationBn}
                onChange={e => setEditingEntry({...editingEntry, pronunciationBn: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 font-bengali"
                placeholder="e.g. অ্যাপল or সূর্য"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">IPA Phonetic</label>
              <input 
                value={editingEntry.phonetic}
                onChange={e => setEditingEntry({...editingEntry, phonetic: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 font-mono"
              />
            </div>
          </div>

          {/* Grammar Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-sm border-b pb-2 border-slate-200">Linguistics / ব্যাকরণ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Etymology (ব্যুৎপত্তি)</label>
                <input 
                  value={editingEntry.etymology || ''}
                  onChange={e => setEditingEntry({...editingEntry, etymology: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 font-bengali"
                  placeholder="e.g. ন + জ্ঞান"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Sandhi (সন্ধি) - Optional</label>
                <input 
                  value={editingEntry.sandhi || ''}
                  onChange={e => setEditingEntry({...editingEntry, sandhi: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 font-bengali"
                  placeholder="e.g. বিদ্যা + আলয়"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Samas (সমাস) - Optional</label>
                <input 
                  value={editingEntry.samas || ''}
                  onChange={e => setEditingEntry({...editingEntry, samas: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 font-bengali"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Source (উৎস)</label>
                    <input 
                      value={editingEntry.source || ''}
                      onChange={e => setEditingEntry({...editingEntry, source: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 font-bengali"
                      placeholder="e.g. তৎসম / ইংরেজি"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Root Word (উৎস শব্দ)</label>
                    <input 
                      value={editingEntry.sourceWord || ''}
                      onChange={e => setEditingEntry({...editingEntry, sourceWord: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 font-bengali"
                    />
                  </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Meaning (অর্থ)</label>
            <textarea 
              value={editingEntry.meaning}
              onChange={e => setEditingEntry({...editingEntry, meaning: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 h-24 font-bengali text-lg"
              placeholder="Primary definition in Bengali"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Detailed Description (বিবরণ)</label>
            <textarea 
              value={editingEntry.description}
              onChange={e => setEditingEntry({...editingEntry, description: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 h-32 font-bengali"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Synonyms</label>
              <input 
                value={editingEntry.synonyms.join(', ')}
                onChange={e => setEditingEntry({...editingEntry, synonyms: e.target.value.split(',').map(s => s.trim())})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Antonyms</label>
              <input 
                value={editingEntry.antonyms.join(', ')}
                onChange={e => setEditingEntry({...editingEntry, antonyms: e.target.value.split(',').map(s => s.trim())})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500"
              />
            </div>
          </div>
           <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Examples (One per line)</label>
            <textarea 
              value={editingEntry.examples.join('\n')}
              onChange={e => setEditingEntry({...editingEntry, examples: e.target.value.split('\n')})}
              className="w-full p-3 border border-slate-200 rounded-xl focus:border-primary-500 h-32 font-bengali"
            />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard List View
  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-in fade-in duration-300">
      <div className="bg-white border-b border-slate-200 p-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={24} className="text-slate-500" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 font-bengali">Admin Dashboard</h1>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-md shadow-primary-200 transition-all transform hover:-translate-y-0.5"
        >
          <Plus size={20} /> Add New Word
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full p-6">
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search stored words..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-100 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Word</th>
                <th className="p-4 font-semibold text-slate-600">Meaning</th>
                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWords.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-slate-400">
                    No words found. Add some words!
                  </td>
                </tr>
              ) : (
                filteredWords.map(word => (
                  <tr key={word.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="p-4 font-medium text-slate-800 font-bengali text-lg">{word.word}</td>
                    <td className="p-4 text-slate-500 font-bengali truncate max-w-xs">{word.meaning}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(word)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(word.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, StickyNote } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  color: string;
}

export const NotesPanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Project Notes',
      content: 'Remember to check timing on the intro sequence',
      timestamp: Date.now() - 3600000,
      color: '#3B82F6'
    },
    {
      id: '2',
      title: 'Style Guide',
      content: 'Use white text with black background for better readability',
      timestamp: Date.now() - 7200000,
      color: '#10B981'
    }
  ]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  const addNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note: Note = {
        id: crypto.randomUUID(),
        title: newNote.title || 'Untitled Note',
        content: newNote.content,
        timestamp: Date.now(),
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      setNotes([note, ...notes]);
      setNewNote({ title: '', content: '' });
    }
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    setEditingId(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Add Note */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Write your note..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addNote}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Note</span>
          </motion.button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notes yet</p>
            </div>
          </div>
        ) : (
          notes.map((note, index) => (
            <motion.div
              key={note.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-2">
                {editingId === note.id ? (
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                    className="flex-1 bg-transparent text-white font-medium focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="font-medium text-white cursor-pointer"
                    onClick={() => setEditingId(note.id)}
                  >
                    {note.title}
                  </h3>
                )}
                
                <div className="flex items-center space-x-1 ml-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: note.color }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEditingId(editingId === note.id ? null : note.id)}
                    className="p-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-3 h-3 text-gray-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </motion.button>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-2">{note.content}</p>
              <p className="text-xs text-gray-500">{formatDate(note.timestamp)}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
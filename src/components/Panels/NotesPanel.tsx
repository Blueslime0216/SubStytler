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
      <div className="neu-panel-header">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full neu-input text-xs"
          />
          <textarea
            placeholder="Write your note..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full neu-input text-xs resize-none"
            rows={3}
          />
          <motion.button
            onClick={addNote}
            className="neu-btn-primary flex items-center space-x-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs">Add Note</span>
          </motion.button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {notes.length === 0 ? (
          <div className="h-full flex items-center justify-center neu-text-secondary">
            <div className="text-center">
              <StickyNote className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No notes yet</p>
            </div>
          </div>
        ) : (
          notes.map((note, index) => (
            <motion.div
              key={note.id}
              className="neu-card p-3"
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
                    className="flex-1 neu-input text-xs font-medium"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="font-medium neu-text-primary cursor-pointer text-sm"
                    onClick={() => setEditingId(note.id)}
                  >
                    {note.title}
                  </h3>
                )}
                
                <div className="flex items-center space-x-1 ml-2">
                  <div 
                    className="w-3 h-3 rounded-full neu-shadow-1"
                    style={{ backgroundColor: note.color }}
                  />
                  <motion.button
                    onClick={() => setEditingId(editingId === note.id ? null : note.id)}
                    className="neu-btn-icon p-1"
                  >
                    <Edit className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    onClick={() => deleteNote(note.id)}
                    className="neu-btn-icon p-1"
                    style={{ color: 'var(--neu-error)' }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
              
              <p className="neu-text-secondary text-xs mb-2">{note.content}</p>
              <p className="text-xs neu-text-secondary">{formatDate(note.timestamp)}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
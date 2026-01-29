import { useState, useEffect } from 'react';
import { Header } from '../components/Header';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

const SUBJECTS = [
  { id: 'math', name: 'Математика', color: '#06b6d4' },
  { id: 'physics', name: 'Физика', color: '#8b5cf6' },
  { id: 'chemistry', name: 'Химия', color: '#10b981' },
  { id: 'biology', name: 'Биология', color: '#ec4899' },
  { id: 'russian', name: 'Русский язык', color: '#f59e0b' },
  { id: 'history', name: 'История', color: '#ef4444' },
  { id: 'informatics', name: 'Информатика', color: '#3b82f6' },
  { id: 'other', name: 'Другое', color: '#6b7280' },
];

function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', subject: 'other' });

  // Загрузка из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user-notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  // Сохранение в localStorage
  const saveNotes = (newNotes: Note[]) => {
    localStorage.setItem('user-notes', JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const createNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Новая заметка',
      content: '',
      subject: 'other',
      color: SUBJECTS.find(s => s.id === 'other')?.color || '#6b7280',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
    };
    saveNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditForm({ title: newNote.title, content: newNote.content, subject: newNote.subject });
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!selectedNote) return;

    const subject = SUBJECTS.find(s => s.id === editForm.subject);
    const updatedNote: Note = {
      ...selectedNote,
      title: editForm.title || 'Без названия',
      content: editForm.content,
      subject: editForm.subject,
      color: subject?.color || '#6b7280',
      updatedAt: new Date().toISOString(),
    };

    const newNotes = notes.map(n => n.id === selectedNote.id ? updatedNote : n);
    saveNotes(newNotes);
    setSelectedNote(updatedNote);
    setIsEditing(false);
  };

  const deleteNote = (noteId: string) => {
    if (confirm('Удалить заметку?')) {
      const newNotes = notes.filter(n => n.id !== noteId);
      saveNotes(newNotes);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    }
  };

  const togglePin = (noteId: string) => {
    const newNotes = notes.map(n =>
      n.id === noteId ? { ...n, pinned: !n.pinned } : n
    );
    saveNotes(newNotes);
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, pinned: !selectedNote.pinned });
    }
  };

  const selectNote = (note: Note) => {
    if (isEditing && selectedNote) {
      saveNote();
    }
    setSelectedNote(note);
    setEditForm({ title: note.title, content: note.content, subject: note.subject });
    setIsEditing(false);
  };

  // Фильтрация и сортировка
  const filteredNotes = notes
    .filter(note => {
      if (filterSubject && note.subject !== filterSubject) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return note.title.toLowerCase().includes(query) ||
               note.content.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-30" />

        <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Заметки
              </h1>
              <p className="text-gray-400 mt-1">Ваши личные шпаргалки и конспекты</p>
            </div>
            <button
              onClick={createNote}
              className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-xl font-medium hover:bg-amber-500/30 transition-colors"
            >
              + Новая заметка
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Список заметок */}
            <div className="space-y-4">
              {/* Поиск */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск заметок..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
              />

              {/* Фильтр по предмету */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterSubject(null)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    !filterSubject
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Все
                </button>
                {SUBJECTS.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setFilterSubject(subject.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filterSubject === subject.id
                        ? 'text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: filterSubject === subject.id ? subject.color + '40' : undefined,
                    }}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>

              {/* Список */}
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {notes.length === 0 ? 'Нет заметок' : 'Ничего не найдено'}
                  </div>
                ) : (
                  filteredNotes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-l-4 ${
                        selectedNote?.id === note.id
                          ? 'bg-gray-800 border-amber-500'
                          : 'bg-gray-900/50 border-transparent hover:bg-gray-800/50'
                      }`}
                      style={{ borderLeftColor: note.color }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {note.pinned && <span className="text-amber-400">📌</span>}
                            <h3 className="font-medium text-white truncate">{note.title}</h3>
                          </div>
                          <p className="text-gray-500 text-sm truncate mt-1">
                            {note.content || 'Пустая заметка'}
                          </p>
                          <p className="text-gray-600 text-xs mt-2">{formatDate(note.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Редактор */}
            <div className="lg:col-span-2">
              {selectedNote ? (
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 h-full">
                  {/* Панель инструментов */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePin(selectedNote.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedNote.pinned
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                        title={selectedNote.pinned ? 'Открепить' : 'Закрепить'}
                      >
                        📌
                      </button>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
                        >
                          ✏️ Редактировать
                        </button>
                      ) : (
                        <button
                          onClick={saveNote}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          💾 Сохранить
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>

                  {isEditing ? (
                    /* Режим редактирования */
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white text-xl font-bold focus:border-amber-500 focus:outline-none"
                        placeholder="Название заметки"
                      />

                      <select
                        value={editForm.subject}
                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                      >
                        {SUBJECTS.map(subject => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>

                      <textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        className="w-full h-[400px] px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none resize-none font-mono"
                        placeholder="Текст заметки..."
                      />
                    </div>
                  ) : (
                    /* Режим просмотра */
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="px-3 py-1 rounded-lg text-sm text-white"
                          style={{ backgroundColor: selectedNote.color + '40' }}
                        >
                          {SUBJECTS.find(s => s.id === selectedNote.subject)?.name}
                        </span>
                        <span className="text-gray-500 text-sm">
                          Изменено: {formatDate(selectedNote.updatedAt)}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-white mb-4">{selectedNote.title}</h2>

                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                          {selectedNote.content || 'Заметка пуста. Нажмите "Редактировать" чтобы добавить текст.'}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-12 h-full flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-white mb-2">Выберите заметку</h3>
                  <p className="text-gray-400 mb-6">
                    Выберите заметку из списка слева или создайте новую
                  </p>
                  <button
                    onClick={createNote}
                    className="px-6 py-3 bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-xl font-medium hover:bg-amber-500/30 transition-colors"
                  >
                    + Создать заметку
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default NotesPage;

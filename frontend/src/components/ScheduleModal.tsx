import { useState } from 'react';

interface Lesson {
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
}

interface DaySchedule {
  day: string;
  lessons: Lesson[];
}

// Демо-расписание (можно заменить на реальные данные с sarli64.ru)
const SCHEDULE_DATA: Record<string, DaySchedule[]> = {
  '8А': [
    {
      day: 'Понедельник',
      lessons: [
        { time: '08:30 - 09:15', subject: 'Математика', room: '301' },
        { time: '09:25 - 10:10', subject: 'Русский язык', room: '205' },
        { time: '10:30 - 11:15', subject: 'Физика', room: '310' },
        { time: '11:25 - 12:10', subject: 'История', room: '208' },
        { time: '12:30 - 13:15', subject: 'Английский язык', room: '304' },
        { time: '13:25 - 14:10', subject: 'Физкультура', room: 'Спортзал' },
      ],
    },
    {
      day: 'Вторник',
      lessons: [
        { time: '08:30 - 09:15', subject: 'Информатика', room: '312' },
        { time: '09:25 - 10:10', subject: 'Информатика', room: '312' },
        { time: '10:30 - 11:15', subject: 'Литература', room: '205' },
        { time: '11:25 - 12:10', subject: 'Геометрия', room: '301' },
        { time: '12:30 - 13:15', subject: 'Биология', room: '315' },
        { time: '13:25 - 14:10', subject: 'География', room: '209' },
      ],
    },
    {
      day: 'Среда',
      lessons: [
        { time: '08:30 - 09:15', subject: 'Алгебра', room: '301' },
        { time: '09:25 - 10:10', subject: 'Химия', room: '316' },
        { time: '10:30 - 11:15', subject: 'Русский язык', room: '205' },
        { time: '11:25 - 12:10', subject: 'Обществознание', room: '208' },
        { time: '12:30 - 13:15', subject: 'Физика', room: '310' },
        { time: '13:25 - 14:10', subject: 'ОБЖ', room: '102' },
      ],
    },
    {
      day: 'Четверг',
      lessons: [
        { time: '08:30 - 09:15', subject: 'Английский язык', room: '304' },
        { time: '09:25 - 10:10', subject: 'Математика', room: '301' },
        { time: '10:30 - 11:15', subject: 'Литература', room: '205' },
        { time: '11:25 - 12:10', subject: 'Физика', room: '310' },
        { time: '12:30 - 13:15', subject: 'История', room: '208' },
        { time: '13:25 - 14:10', subject: 'Музыка', room: '105' },
      ],
    },
    {
      day: 'Пятница',
      lessons: [
        { time: '08:30 - 09:15', subject: 'Геометрия', room: '301' },
        { time: '09:25 - 10:10', subject: 'Биология', room: '315' },
        { time: '10:30 - 11:15', subject: 'Русский язык', room: '205' },
        { time: '11:25 - 12:10', subject: 'Технология', room: '118' },
        { time: '12:30 - 13:15', subject: 'Технология', room: '118' },
        { time: '13:25 - 14:10', subject: 'Классный час', room: '205' },
      ],
    },
    {
      day: 'Суббота',
      lessons: [
        { time: '08:30 - 09:15', subject: 'Алгебра', room: '301' },
        { time: '09:25 - 10:10', subject: 'Химия', room: '316' },
        { time: '10:30 - 11:15', subject: 'ИЗО', room: '107' },
        { time: '11:25 - 12:10', subject: 'Физкультура', room: 'Спортзал' },
      ],
    },
  ],
  '8Б': [
    {
      day: 'Понедельник',
      lessons: [
        { time: '08:30 - 09:15', subject: 'Русский язык', room: '206' },
        { time: '09:25 - 10:10', subject: 'Математика', room: '302' },
        { time: '10:30 - 11:15', subject: 'История', room: '209' },
        { time: '11:25 - 12:10', subject: 'Физика', room: '310' },
        { time: '12:30 - 13:15', subject: 'Биология', room: '315' },
        { time: '13:25 - 14:10', subject: 'Английский язык', room: '305' },
      ],
    },
    // ... остальные дни
  ],
};

const CLASSES = ['8А', '8Б', '9А', '9Б', '10А', '10Б', '11А', '11Б'];
const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const SUBJECT_COLORS: Record<string, string> = {
  'Математика': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Алгебра': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Геометрия': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Русский язык': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Литература': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Физика': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Информатика': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'История': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Обществознание': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Химия': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Биология': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'География': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'Английский язык': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Физкультура': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  'ОБЖ': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Технология': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  'Музыка': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'ИЗО': 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  'Классный час': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
};

function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

function getCurrentDayIndex(): number {
  const day = new Date().getDay();
  // Воскресенье = 0, но нам нужен индекс для массива DAYS
  return day === 0 ? 5 : day - 1; // Если воскресенье, показываем субботу
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  const [selectedClass, setSelectedClass] = useState('8А');
  const [selectedDayIndex, setSelectedDayIndex] = useState(getCurrentDayIndex());

  if (!isOpen) return null;

  const schedule = SCHEDULE_DATA[selectedClass] || SCHEDULE_DATA['8А'];
  const currentSchedule = schedule.find(s => s.day === DAYS[selectedDayIndex]) || schedule[0];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <h2 className="text-xl font-bold text-white">Расписание уроков</h2>
              <p className="text-gray-400 text-sm">Лицей-интернат №64</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Выбор класса */}
        <div className="px-6 py-4 border-b border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Класс:</p>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedClass === cls
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Выбор дня */}
        <div className="px-6 py-3 border-b border-gray-800 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {DAYS.map((day, index) => {
              const isToday = index === getCurrentDayIndex();
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedDayIndex === index
                      ? 'bg-cyan-500 text-white'
                      : isToday
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {day.slice(0, 2)}
                  <span className="hidden sm:inline">{day.slice(2)}</span>
                  {isToday && selectedDayIndex !== index && (
                    <span className="ml-1 text-xs">•</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Расписание */}
        <div className="px-6 py-4 overflow-y-auto max-h-[400px]">
          <div className="space-y-2">
            {currentSchedule?.lessons.map((lesson, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-3 rounded-xl border ${getSubjectColor(lesson.subject)}`}
              >
                <div className="text-center min-w-[60px]">
                  <p className="text-xs text-gray-500">{index + 1} урок</p>
                  <p className="text-sm font-mono">{lesson.time.split(' - ')[0]}</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{lesson.subject}</p>
                  {lesson.room && (
                    <p className="text-sm opacity-70">Каб. {lesson.room}</p>
                  )}
                </div>
              </div>
            ))}

            {(!currentSchedule?.lessons || currentSchedule.lessons.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">🎉</p>
                <p>Нет уроков в этот день!</p>
              </div>
            )}
          </div>
        </div>

        {/* Футер */}
        <div className="px-6 py-3 border-t border-gray-800 bg-gray-900/50">
          <p className="text-gray-500 text-xs text-center">
            Данные носят справочный характер. Уточняйте расписание на{' '}
            <a
              href="http://sarli64.ru/schedule/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              sarli64.ru
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ScheduleButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 hover:from-emerald-500/20 hover:to-cyan-500/20 border border-emerald-500/30 rounded-xl text-gray-200 transition-all duration-300 hover:scale-105"
      >
        <span className="text-lg">📅</span>
        <span className="font-medium hidden sm:inline">Расписание</span>
      </button>
      <ScheduleModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

import { TOPIC_ADVICE } from '../topicAdvice';
import { ALL_SUBJECTS } from './index';
import type { TheoryTopic, SubjectKey } from './types';

export function findTheoryForTask(
  subject: string,
  examType: string,
  taskNumber: number | string,
  taskTopic?: string,
): TheoryTopic | null {
  const subjectKey = normalizeSubject(subject);
  if (!subjectKey) return null;

  const subjectData = ALL_SUBJECTS.find(s => s.subject === subjectKey);
  if (!subjectData || subjectData.topics.length === 0) return null;

  const canonicalTopic = getCanonicalTopic(subject, examType, String(taskNumber));

  if (canonicalTopic) {
    const byTitle = findByTitle(subjectData.topics, canonicalTopic);
    if (byTitle) return byTitle;
  }

  if (taskTopic && taskTopic.trim()) {
    const byTaskTopic = findByTitle(subjectData.topics, taskTopic);
    if (byTaskTopic) return byTaskTopic;

    const byKeywords = findByKeywords(subjectData.topics, taskTopic);
    if (byKeywords) return byKeywords;
  }

  const num = typeof taskNumber === 'string' ? parseInt(taskNumber, 10) : taskNumber;
  if (!isNaN(num)) {
    const byTaskNum = subjectData.topics.find(t => t.tasks.includes(num));
    if (byTaskNum) return byTaskNum;
  }

  return null;
}

function normalizeSubject(subject: string): SubjectKey | null {
  const upper = subject.toUpperCase();
  const subjectMap: Record<string, SubjectKey> = {
    MATHEMATICS: 'MATHEMATICS',
    PHYSICS: 'PHYSICS',
    RUSSIAN: 'RUSSIAN',
    INFORMATICS: 'INFORMATICS',
    BIOLOGY: 'BIOLOGY',
    CHEMISTRY: 'CHEMISTRY',
    math: 'MATHEMATICS',
    mathb: 'MATHEMATICS',
    phys: 'PHYSICS',
    rus: 'RUSSIAN',
    inf: 'INFORMATICS',
    bio: 'BIOLOGY',
    chem: 'CHEMISTRY',
  };
  return subjectMap[subject] ?? subjectMap[upper] ?? null;
}

function getCanonicalTopic(subject: string, examType: string, taskNumber: string): string | null {
  const keys = [
    `${subject}_${examType}`,
    `${subject.toUpperCase()}_${examType.toUpperCase()}`,
    `${subject.toUpperCase()}_${examType}`,
  ];

  for (const key of keys) {
    const mapping = TOPIC_ADVICE[key];
    if (mapping?.[taskNumber]) {
      return mapping[taskNumber].topic;
    }
  }
  return null;
}

function findByTitle(topics: TheoryTopic[], search: string): TheoryTopic | null {
  const searchLower = search.toLowerCase().trim();

  // Exact match first
  const exact = topics.find(t => t.title.toLowerCase() === searchLower);
  if (exact) return exact;

  // Then check if topic title contains the search or vice versa
  const includes = topics.find(
    t =>
      t.title.toLowerCase().includes(searchLower) ||
      searchLower.includes(t.title.toLowerCase()),
  );
  if (includes) return includes;

  // Check descriptions too
  const byDesc = topics.find(
    t => t.description.toLowerCase().includes(searchLower),
  );
  if (byDesc) return byDesc;

  return null;
}

function findByKeywords(topics: TheoryTopic[], search: string): TheoryTopic | null {
  const searchWords = search.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (searchWords.length === 0) return null;

  let bestMatch: TheoryTopic | null = null;
  let bestScore = 0;

  for (const topic of topics) {
    if (!topic.keywords) continue;
    let score = 0;
    for (const word of searchWords) {
      for (const kw of topic.keywords) {
        if (kw.includes(word) || word.includes(kw)) {
          score++;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

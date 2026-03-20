export type { TheoryTopic, TheorySection, TheoryExample, SubjectKey, SubjectTheory } from './types';

export { mathematicsTopics } from './mathematics';
export { physicsTopics } from './physics';
export { russianTopics } from './russian';
export { informaticsTopics } from './informatics';
export { biologyTopics } from './biology';
export { chemistryTopics } from './chemistry';
export { socialTopics } from './social';

import { mathematicsTopics } from './mathematics';
import { physicsTopics } from './physics';
import { russianTopics } from './russian';
import { informaticsTopics } from './informatics';
import { biologyTopics } from './biology';
import { chemistryTopics } from './chemistry';
import { socialTopics } from './social';

import type { SubjectKey, SubjectTheory } from './types';

export const ALL_SUBJECTS: SubjectTheory[] = [
  { subject: 'MATHEMATICS', label: 'Математика', icon: '📐', topics: mathematicsTopics },
  { subject: 'PHYSICS', label: 'Физика', icon: '⚡', topics: physicsTopics },
  { subject: 'RUSSIAN', label: 'Русский язык', icon: '📝', topics: russianTopics },
  { subject: 'INFORMATICS', label: 'Информатика', icon: '💻', topics: informaticsTopics },
  { subject: 'BIOLOGY', label: 'Биология', icon: '🧬', topics: biologyTopics },
  { subject: 'CHEMISTRY', label: 'Химия', icon: '🧪', topics: chemistryTopics },
  { subject: 'SOCIAL', label: 'Обществознание', icon: '🌐', topics: socialTopics },
];

export function getSubjectTopics(subject: SubjectKey) {
  return ALL_SUBJECTS.find(s => s.subject === subject)?.topics ?? [];
}

export function getSubjectByKey(subject: SubjectKey): SubjectTheory | undefined {
  return ALL_SUBJECTS.find(s => s.subject === subject);
}

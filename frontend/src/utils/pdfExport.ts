import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfQuestionResult {
  number: number;
  topic: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
}

export interface PdfExportData {
  examTitle: string;
  date: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  totalPoints: number;
  maxPoints: number;
  questionResults: PdfQuestionResult[];
}

// Transliteration map for Cyrillic fallback
const TRANSLIT: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
};

function transliterate(text: string): string {
  return text.split('').map(ch => TRANSLIT[ch] ?? ch).join('');
}

async function loadFont(doc: jsPDF): Promise<boolean> {
  try {
    // Try to load PTSans font dynamically
    const fontModule = await import('../assets/fonts/PTSans-Regular-normal.js');
    const fontData = fontModule.default;
    if (fontData) {
      doc.addFileToVFS('PTSans-Regular.ttf', fontData);
      doc.addFont('PTSans-Regular.ttf', 'PTSans', 'normal');
      doc.setFont('PTSans');
      return true;
    }
  } catch {
    // Font not available
  }
  return false;
}

export async function exportTestResultPDF(data: PdfExportData): Promise<void> {
  const doc = new jsPDF();
  const hasCyrillic = await loadFont(doc);

  const t = (text: string) => hasCyrillic ? text : transliterate(text);

  // Title
  doc.setFontSize(18);
  doc.text(t(data.examTitle), 14, 20);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(t(`Дата: ${data.date}`), 14, 28);

  // Score summary
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text(t(`Результат: ${data.scorePercent}%`), 14, 40);

  doc.setFontSize(11);
  doc.text(t(`Правильных ответов: ${data.correctCount} из ${data.totalQuestions}`), 14, 48);
  doc.text(t(`Баллы: ${data.totalPoints} из ${data.maxPoints}`), 14, 55);

  // Line separator
  doc.setDrawColor(200);
  doc.line(14, 60, 196, 60);

  // Question results table
  doc.setFontSize(12);
  doc.text(t('Детальный разбор'), 14, 68);

  const tableHead = [
    [t('№'), t('Тема'), t('Ваш ответ'), t('Правильный'), t('Статус'), t('Баллы')],
  ];

  const tableBody = data.questionResults.map(q => [
    String(q.number),
    t(q.topic || '—'),
    t(q.userAnswer || 'Нет ответа'),
    t(q.correctAnswer),
    t(q.isCorrect ? 'Верно' : 'Неверно'),
    q.isCorrect ? `+${q.points}` : '0',
  ]);

  autoTable(doc, {
    startY: 72,
    head: tableHead,
    body: tableBody,
    styles: {
      font: hasCyrillic ? 'PTSans' : 'helvetica',
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 45 },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      t('Лицей-интернат №64 — Платформа подготовки'),
      14,
      doc.internal.pageSize.height - 10,
    );
    doc.text(
      `${i}/${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
    );
  }

  doc.save(`${data.examTitle.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}_${data.date}.pdf`);
}

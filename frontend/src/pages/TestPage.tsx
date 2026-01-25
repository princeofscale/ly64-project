import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';

interface Question {
  id: string;
  question: string;
  type: string;
  options: string[] | null;
}

interface TestData {
  test: {
    id: string;
    title: string;
    timeLimit: number | null;
    preventBackNavigation: boolean;
    questionsCount: number;
  };
  questions: Question[];
  questionsOrder: string[];
}

interface Answer {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
  timestamp: number;
}

export default function TestPage() {
  const { testId, subject } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const loadTest = useCallback(async () => {
    try {
      let url = '';
      if (subject) {
        const testsResponse = await fetch(
          `/api/tests?subject=${subject}&isDiagnostic=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const testsData = await testsResponse.json();
        if (testsData.data && testsData.data.length > 0) {
          url = `/api/tests/${testsData.data[0].id}/start`;
        } else {
          toast.error('Тест не найден');
          navigate('/diagnostic');
          return;
        }
      } else if (testId) {
        url = `/api/tests/${testId}/start`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setTestData(data.data);
        if (data.data.test.timeLimit) {
          setTimeLeft(data.data.test.timeLimit * 60);
        }
      } else {
        toast.error('Ошибка загрузки теста');
        navigate(-1);
      }
    } catch (error) {
      toast.error('Ошибка загрузки');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [testId, subject, token, navigate]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!testData || selectedAnswer === null) return;

    const currentQuestion = testData.questions[currentIndex];
    const timeSpent = Date.now() - questionStartTime;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      timeSpent,
      timestamp: Date.now(),
    };

    setAnswers((prev) => [...prev, newAnswer]);
    setSelectedAnswer(null);
    setQuestionStartTime(Date.now());

    if (currentIndex < testData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit([...answers, newAnswer]);
    }
  };

  const handleSubmit = async (finalAnswers?: Answer[]) => {
    if (!testData) return;

    setSubmitting(true);
    const answersToSubmit = finalAnswers || answers;

    try {
      const response = await fetch(`/api/tests/${testData.test.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: answersToSubmit,
          questionsOrder: testData.questionsOrder,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (subject) {
          await fetch('/api/diagnostic/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              subject,
              score: data.data.score,
            }),
          });
        }

        toast.success(`Тест завершён! Результат: ${data.data.score}%`);

        if (data.data.analysis) {
          toast.error('Обнаружена подозрительная активность', { duration: 5000 });
        }

        if (subject) {
          navigate('/diagnostic');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error('Ошибка отправки');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!testData) return null;

  const currentQuestion = testData.questions[currentIndex];
  const progress = ((currentIndex + 1) / testData.questions.length) * 100;

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              {testData.test.title}
            </h1>
            {timeLeft !== null && (
              <div
                className={`px-4 py-2 rounded-lg font-mono text-lg ${
                  timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                }`}
              >
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Вопрос {currentIndex + 1} из {testData.questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-6">{currentQuestion.question}</h2>

            {currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                      selectedAnswer === option
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="font-medium mr-3">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            {testData.test.preventBackNavigation ? (
              <span className="text-sm text-gray-500">
                Возврат к предыдущим вопросам запрещён
              </span>
            ) : (
              <div />
            )}

            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null || submitting}
            >
              {submitting
                ? 'Отправка...'
                : currentIndex < testData.questions.length - 1
                ? 'Далее'
                : 'Завершить'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
